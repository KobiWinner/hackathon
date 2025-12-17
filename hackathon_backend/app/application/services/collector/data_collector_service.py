import asyncio
import time
from datetime import datetime
from typing import List, Optional, Dict, Any

from ....core.config.settings import get_settings
from ....core.infrastructure.http_client import ResilientHttpClient, HttpClientConfig
from ....core.infrastructure.circuit_breaker import CircuitOpenError
from ....core.infrastructure.cache import get_cache

from ..provider.adapters import get_adapter, get_all_adapters, ADAPTER_REGISTRY
from ..provider.dto.provider_product_dto import ProviderProductDTO
from .dto.collector_result import CollectorResult, ProviderResult, CollectorStats


class DataCollectorService:
    """
    Tüm provider'lardan paralel olarak veri toplayan servis.
    
    Özellikler:
    - Paralel veri çekme (asyncio.gather)
    - Circuit breaker entegrasyonu
    - Cache desteği (TTL ile)
    - Provider reliability tracking
    
    Kullanım:
        collector = DataCollectorService()
        result = await collector.collect_all()
        
        for product in result.get_all_products():
            print(product.name, product.price)
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = get_cache()
        self._http_clients: Dict[str, ResilientHttpClient] = {}
    
    def _get_http_client(self, provider_name: str) -> ResilientHttpClient:
        """Provider için HTTP client al veya oluştur"""
        if provider_name not in self._http_clients:
            config = HttpClientConfig(
                timeout_seconds=self.settings.COLLECTOR_TIMEOUT_SECONDS,
                max_retries=self.settings.COLLECTOR_MAX_RETRIES,
            )
            self._http_clients[provider_name] = ResilientHttpClient(
                provider_name=provider_name,
                config=config,
            )
        return self._http_clients[provider_name]
    
    def _get_provider_url(self, provider_name: str) -> str:
        """Provider için tam URL oluştur"""
        base_url = self.settings.PROVIDER_BASE_URL
        endpoint = self.settings.PROVIDER_ENDPOINTS.get(provider_name, "")
        return f"{base_url}{endpoint}"
    
    def _get_cache_key(self, provider_name: str) -> str:
        """Cache key oluştur"""
        return f"collector:products:{provider_name}"
    
    async def _fetch_from_provider(self, provider_name: str) -> ProviderResult:
        """
        Tek bir provider'dan veri çek.
        
        Args:
            provider_name: Provider adı
            
        Returns:
            ProviderResult: Toplama sonucu
        """
        start_time = time.time()
        
        try:
            # Cache kontrolü
            cache_key = self._get_cache_key(provider_name)
            cached_data = await self._get_from_cache(cache_key)
            
            if cached_data:
                print(f"[{provider_name}] Cache hit!")
                return ProviderResult(
                    provider_name=provider_name,
                    success=True,
                    products=cached_data,
                    response_time_ms=0.0,  # Cache'den geldi
                )
            
            # API'den çek
            url = self._get_provider_url(provider_name)
            client = self._get_http_client(provider_name)
            
            print(f"[{provider_name}] Fetching from {url}")
            response = await client.get(url)
            
            # Adapter ile normalize et
            adapter = get_adapter(provider_name)
            products = adapter.adapt_response(response)
            
            elapsed_ms = (time.time() - start_time) * 1000
            
            # Cache'e kaydet
            await self._save_to_cache(cache_key, products)
            
            print(f"[{provider_name}] Success: {len(products)} products in {elapsed_ms:.0f}ms")
            
            return ProviderResult(
                provider_name=provider_name,
                success=True,
                products=products,
                response_time_ms=elapsed_ms,
            )
            
        except CircuitOpenError as e:
            elapsed_ms = (time.time() - start_time) * 1000
            print(f"[{provider_name}] Circuit OPEN - skipped")
            return ProviderResult(
                provider_name=provider_name,
                success=False,
                error_message=f"Circuit breaker open: {e}",
                response_time_ms=elapsed_ms,
            )
            
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            print(f"[{provider_name}] Error: {e}")
            return ProviderResult(
                provider_name=provider_name,
                success=False,
                error_message=str(e),
                response_time_ms=elapsed_ms,
            )
    
    async def _get_from_cache(self, key: str) -> Optional[List[ProviderProductDTO]]:
        """Cache'den veri al"""
        try:
            if self.cache:
                cached = await self.cache.get(key)
                if cached:
                    # Dict listesini DTO'ya çevir
                    return [
                        ProviderProductDTO(**item) 
                        for item in cached
                    ]
        except Exception as e:
            print(f"Cache read error: {e}")
        return None
    
    async def _save_to_cache(self, key: str, products: List[ProviderProductDTO]) -> None:
        """Cache'e kaydet"""
        try:
            if self.cache:
                # DTO'ları dict'e çevir
                data = [p.to_dict() for p in products]
                await self.cache.set(
                    key, 
                    data, 
                    ttl=self.settings.COLLECTOR_CACHE_TTL_SECONDS
                )
        except Exception as e:
            print(f"Cache write error: {e}")
    
    async def collect_all(
        self,
        provider_names: Optional[List[str]] = None
    ) -> CollectorResult:
        """
        Tüm provider'lardan paralel olarak veri topla.
        
        Args:
            provider_names: Opsiyonel provider listesi. 
                           None ise tüm provider'lardan çeker.
        
        Returns:
            CollectorResult: Toplama sonuçları
        """
        start_time = time.time()
        
        # Hangi provider'lardan çekeceğiz?
        if provider_names is None:
            provider_names = list(ADAPTER_REGISTRY.keys())
        
        print(f"[Collector] Starting collection from {len(provider_names)} providers...")
        
        # Paralel olarak tüm provider'lardan çek
        tasks = [
            self._fetch_from_provider(name) 
            for name in provider_names
        ]
        results: List[ProviderResult] = await asyncio.gather(*tasks)
        
        # İstatistikleri hesapla
        total_time_ms = (time.time() - start_time) * 1000
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        total_products = sum(r.product_count for r in successful)
        
        stats = CollectorStats(
            total_providers=len(results),
            successful_providers=len(successful),
            failed_providers=len(failed),
            total_products=total_products,
            total_time_ms=total_time_ms,
        )
        
        print(
            f"[Collector] Completed: {stats.successful_providers}/{stats.total_providers} "
            f"providers, {stats.total_products} products in {total_time_ms:.0f}ms"
        )
        
        return CollectorResult(
            results=results,
            stats=stats,
        )
    
    async def collect_single(self, provider_name: str) -> ProviderResult:
        """
        Tek bir provider'dan veri topla.
        
        Args:
            provider_name: Provider adı
            
        Returns:
            ProviderResult: Toplama sonucu
        """
        if provider_name not in ADAPTER_REGISTRY:
            return ProviderResult(
                provider_name=provider_name,
                success=False,
                error_message=f"Unknown provider: {provider_name}",
            )
        
        return await self._fetch_from_provider(provider_name)
    
    async def invalidate_cache(self, provider_name: Optional[str] = None) -> None:
        """
        Cache'i temizle.
        
        Args:
            provider_name: Belirli provider için temizle, 
                          None ise tüm cache'i temizle
        """
        try:
            if self.cache:
                if provider_name:
                    key = self._get_cache_key(provider_name)
                    await self.cache.delete(key)
                    print(f"[Cache] Invalidated: {key}")
                else:
                    # Tüm provider cache'lerini temizle
                    for name in ADAPTER_REGISTRY.keys():
                        key = self._get_cache_key(name)
                        await self.cache.delete(key)
                    print("[Cache] Invalidated all provider caches")
        except Exception as e:
            print(f"Cache invalidation error: {e}")
    
    async def close(self) -> None:
        """HTTP client'ları kapat"""
        for client in self._http_clients.values():
            await client.close()
        self._http_clients.clear()


# Singleton instance
_collector_instance: Optional[DataCollectorService] = None


def get_data_collector() -> DataCollectorService:
    """Data collector singleton instance"""
    global _collector_instance
    if _collector_instance is None:
        _collector_instance = DataCollectorService()
    return _collector_instance
