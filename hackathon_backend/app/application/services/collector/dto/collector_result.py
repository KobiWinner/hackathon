from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any

from ...provider.dto.provider_product_dto import ProviderProductDTO


@dataclass
class ProviderResult:
    """Tek bir provider'dan toplanan sonuç"""
    provider_name: str
    success: bool
    products: List[ProviderProductDTO] = field(default_factory=list)
    error_message: Optional[str] = None
    response_time_ms: float = 0.0
    fetched_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def product_count(self) -> int:
        return len(self.products)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "provider_name": self.provider_name,
            "success": self.success,
            "product_count": self.product_count,
            "error_message": self.error_message,
            "response_time_ms": self.response_time_ms,
            "fetched_at": self.fetched_at.isoformat(),
        }


@dataclass
class CollectorStats:
    """Toplama işlemi istatistikleri"""
    total_providers: int = 0
    successful_providers: int = 0
    failed_providers: int = 0
    total_products: int = 0
    total_time_ms: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_providers": self.total_providers,
            "successful_providers": self.successful_providers,
            "failed_providers": self.failed_providers,
            "total_products": self.total_products,
            "total_time_ms": self.total_time_ms,
            "success_rate": (
                self.successful_providers / self.total_providers * 100
                if self.total_providers > 0 else 0
            ),
        }


@dataclass
class CollectorResult:
    """Tüm provider'lardan toplanan sonuçlar"""
    results: List[ProviderResult] = field(default_factory=list)
    stats: CollectorStats = field(default_factory=CollectorStats)
    collected_at: datetime = field(default_factory=datetime.utcnow)
    
    def get_all_products(self) -> List[ProviderProductDTO]:
        """Tüm başarılı provider'lardan ürünleri birleştir"""
        all_products = []
        for result in self.results:
            if result.success:
                all_products.extend(result.products)
        return all_products
    
    def get_successful_results(self) -> List[ProviderResult]:
        """Sadece başarılı sonuçları döndür"""
        return [r for r in self.results if r.success]
    
    def get_failed_results(self) -> List[ProviderResult]:
        """Sadece başarısız sonuçları döndür"""
        return [r for r in self.results if not r.success]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "collected_at": self.collected_at.isoformat(),
            "stats": self.stats.to_dict(),
            "results": [r.to_dict() for r in self.results],
        }
