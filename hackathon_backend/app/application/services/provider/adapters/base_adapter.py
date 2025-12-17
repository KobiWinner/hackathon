from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime

from ..dto.provider_product_dto import ProviderProductDTO


class BaseProviderAdapter(ABC):
    """
    Tüm provider adapter'larının implement etmesi gereken abstract base class.
    Her provider kendi response formatını ProviderProductDTO'ya dönüştürür.
    """
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Provider'ın unique adı (URL'de kullanılan slug)"""
        pass
    
    @property
    @abstractmethod
    def currency(self) -> str:
        """Provider'ın kullandığı para birimi kodu"""
        pass
    
    @abstractmethod
    def adapt_product(self, raw_product: Dict[str, Any]) -> ProviderProductDTO:
        """
        Tek bir ürünü provider formatından ortak DTO'ya dönüştürür.
        
        Args:
            raw_product: Provider'dan gelen ham ürün verisi
            
        Returns:
            ProviderProductDTO: Normalize edilmiş ürün
        """
        pass
    
    def adapt_response(self, response: Dict[str, Any]) -> List[ProviderProductDTO]:
        """
        Provider response'unu parse edip ürün listesi döndürür.
        
        Args:
            response: Provider API'den gelen tam response
            
        Returns:
            List[ProviderProductDTO]: Normalize edilmiş ürün listesi
        """
        products = self._extract_products_list(response)
        adapted_products = []
        
        for raw_product in products:
            try:
                dto = self.adapt_product(raw_product)
                adapted_products.append(dto)
            except Exception as e:
                # Hatalı ürünü logla ama diğerlerini işlemeye devam et
                print(f"[{self.provider_name}] Ürün adapt hatası: {e}, data: {raw_product}")
                continue
        
        return adapted_products
    
    @abstractmethod
    def _extract_products_list(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Response'dan ürün listesini çıkarır.
        Her provider farklı key kullanabilir (products, items, produkte, vb.)
        """
        pass
    
    def _safe_get(self, data: Dict, key: str, default: Any = None) -> Any:
        """Güvenli dictionary erişimi"""
        return data.get(key, default)
    
    def _parse_datetime(self, value: str) -> datetime:
        """ISO format datetime parse"""
        if value:
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                pass
        return datetime.utcnow()
