from typing import Dict, Any, List
from decimal import Decimal

from .base_adapter import BaseProviderAdapter
from ..dto.provider_product_dto import ProviderProductDTO


class OutdoorProAdapter(BaseProviderAdapter):
    """
    OutdoorPro API response adapter.
    
    Response format:
    {
        "source": "OutdoorPro",
        "count": 21,
        "items": [
            {
                "id": 1,
                "name": "NorthFace Stormbreak 2 Çadır",
                "brand": "NorthFace",
                "category": "Kamp",
                "price": 325.95,
                "currency": "USD",
                "stock": 27,
                "available": true
            }
        ]
    }
    """
    
    @property
    def provider_name(self) -> str:
        return "outdoor-pro"
    
    @property
    def currency(self) -> str:
        return "USD"
    
    def _extract_products_list(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        return response.get("items", [])
    
    def adapt_product(self, raw_product: Dict[str, Any]) -> ProviderProductDTO:
        return ProviderProductDTO(
            external_id=str(raw_product["id"]),
            provider_name=self.provider_name,
            name=raw_product["name"],
            brand=raw_product["brand"],
            category=raw_product["category"],
            subcategory=None,  # OutdoorPro subcategory göndemiyor
            price=Decimal(str(raw_product["price"])),
            currency=raw_product.get("currency", self.currency),
            stock_quantity=raw_product.get("stock", 0),
            in_stock=raw_product.get("available", False),
            colour=None,  # OutdoorPro renk göndemiyor
            weight_kg=None,  # OutdoorPro ağırlık göndemiyor
            raw_data=raw_product,
        )
