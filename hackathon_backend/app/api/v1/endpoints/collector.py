from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from ....application.services.collector import get_data_collector
from ....application.services.provider.adapters import ADAPTER_REGISTRY
from ....core.infrastructure.circuit_breaker import get_all_circuit_stats


router = APIRouter(prefix="/collector", tags=["Collector"])


@router.get("/collect")
async def collect_all_providers(
    use_cache: bool = Query(default=True, description="Cache kullanılsın mı?")
):
    """
    Tüm provider'lardan veri topla.
    
    - **use_cache**: False ise önce cache temizlenir
    """
    collector = get_data_collector()
    
    if not use_cache:
        await collector.invalidate_cache()
    
    result = await collector.collect_all()
    return result.to_dict()


@router.get("/collect/{provider_name}")
async def collect_single_provider(
    provider_name: str,
    use_cache: bool = Query(default=True, description="Cache kullanılsın mı?")
):
    """
    Tek bir provider'dan veri topla.
    
    - **provider_name**: Provider adı (sport-direct, outdoor-pro, dag-spor, alpine-gear)
    - **use_cache**: False ise önce cache temizlenir
    """
    if provider_name not in ADAPTER_REGISTRY:
        available = ", ".join(ADAPTER_REGISTRY.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Provider '{provider_name}' bulunamadı. Mevcut: {available}"
        )
    
    collector = get_data_collector()
    
    if not use_cache:
        await collector.invalidate_cache(provider_name)
    
    result = await collector.collect_single(provider_name)
    
    if not result.success:
        raise HTTPException(
            status_code=503,
            detail=f"Provider hatası: {result.error_message}"
        )
    
    return result.to_dict()


@router.get("/products")
async def get_all_products(
    provider: Optional[str] = Query(default=None, description="Filtre: provider adı"),
    category: Optional[str] = Query(default=None, description="Filtre: kategori"),
    brand: Optional[str] = Query(default=None, description="Filtre: marka"),
    min_price: Optional[float] = Query(default=None, description="Minimum fiyat"),
    max_price: Optional[float] = Query(default=None, description="Maksimum fiyat"),
):
    """
    Tüm provider'lardan toplanan ürünleri listele.
    
    Opsiyonel filtreler:
    - **provider**: Belirli provider
    - **category**: Kategori filtresi
    - **brand**: Marka filtresi
    - **min_price / max_price**: Fiyat aralığı
    """
    collector = get_data_collector()
    
    # Hangi provider'lardan çekeceğiz?
    if provider:
        if provider not in ADAPTER_REGISTRY:
            raise HTTPException(status_code=404, detail=f"Provider '{provider}' bulunamadı")
        result = await collector.collect_single(provider)
        products = result.products if result.success else []
    else:
        result = await collector.collect_all()
        products = result.get_all_products()
    
    # Filtreleri uygula
    filtered = products
    
    if category:
        filtered = [p for p in filtered if p.category.lower() == category.lower()]
    
    if brand:
        filtered = [p for p in filtered if p.brand.lower() == brand.lower()]
    
    if min_price is not None:
        filtered = [p for p in filtered if float(p.price) >= min_price]
    
    if max_price is not None:
        filtered = [p for p in filtered if float(p.price) <= max_price]
    
    return {
        "total": len(filtered),
        "products": [p.to_dict() for p in filtered]
    }


@router.get("/stats")
async def get_collector_stats():
    """
    Collector ve circuit breaker istatistiklerini getir.
    """
    circuit_stats = get_all_circuit_stats()
    
    return {
        "providers": list(ADAPTER_REGISTRY.keys()),
        "circuit_breakers": circuit_stats,
    }


@router.post("/invalidate-cache")
async def invalidate_cache(
    provider_name: Optional[str] = Query(default=None, description="Provider adı (boş = tümü)")
):
    """
    Collector cache'ini temizle.
    
    - **provider_name**: Belirli provider için temizle, boş bırakırsan tümünü temizler
    """
    collector = get_data_collector()
    await collector.invalidate_cache(provider_name)
    
    return {
        "success": True,
        "message": f"Cache temizlendi: {provider_name or 'tüm provider\'lar'}"
    }
