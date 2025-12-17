from typing import Dict, Any, List
from decimal import Decimal

from .base_adapter import BaseProviderAdapter
from ..dto.provider_product_dto import ProviderProductDTO


class DagSporAdapter(BaseProviderAdapter):
    """
    DagSpor API response adapter (Türkçe format).
    
    Response format:
    {
        "tedarikci": "DagSpor",
        "para_birimi": "TRY",
        "urunler": [
            {
                "urun_id": 1,
                "urun_adi": "Salomon X Ultra 4 GTX",
                "marka": "Salomon",
                "kategori": "Outdoor",
                "alt_kategori": "Ayakkabı",
                "renk": "Gri",
                "agirlik_kg": 0.85,
                "fiyat": 8499.99,
                "stok_adedi": 45,
                "stokta_var": true
            }
        ]
    }
    """
    
    @property
    def provider_name(self) -> str:
        return "dag-spor"
    
    @property
    def currency(self) -> str:
        return "TRY"
    
    def _extract_products_list(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        return response.get("urunler", [])
    
    def adapt_product(self, raw_product: Dict[str, Any]) -> ProviderProductDTO:
        return ProviderProductDTO(
            external_id=str(raw_product["urun_id"]),
            provider_name=self.provider_name,
            name=raw_product["urun_adi"],
            brand=raw_product["marka"],
            category=raw_product["kategori"],
            subcategory=raw_product.get("alt_kategori"),
            price=Decimal(str(raw_product["fiyat"])),
            currency=self.currency,
            stock_quantity=raw_product.get("stok_adedi", 0),
            in_stock=raw_product.get("stokta_var", False),
            colour=raw_product.get("renk"),
            weight_kg=raw_product.get("agirlik_kg"),
            raw_data=raw_product,
        )
