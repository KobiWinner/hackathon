from typing import Dict, Any, List
from decimal import Decimal

from .base_adapter import BaseProviderAdapter
from ..dto.provider_product_dto import ProviderProductDTO


class SportDirectAdapter(BaseProviderAdapter):
    """
    SportDirect API response adapter.
    
    Response format:
    {
        "provider": "SportDirect",
        "currency": "GBP",
        "products": [
            {
                "product_id": 1,
                "product_name": "Nike Pegasus 40",
                "brand": "Nike",
                "category": "Koşu",
                "subcategory": "Ayakkabı",
                "colour": "Mavi",
                "weight_kg": 0.28,
                "price_gbp": 130.95,
                "stock_quantity": 100,
                "in_stock": true
            }
        ]
    }
    """
    
    @property
    def provider_name(self) -> str:
        return "sport-direct"
    
    @property
    def currency(self) -> str:
        return "GBP"
    
    def _extract_products_list(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        return response.get("products", [])
    
    def adapt_product(self, raw_product: Dict[str, Any]) -> ProviderProductDTO:
        return ProviderProductDTO(
            external_id=str(raw_product["product_id"]),
            provider_name=self.provider_name,
            name=raw_product["product_name"],
            brand=raw_product["brand"],
            category=raw_product["category"],
            subcategory=raw_product.get("subcategory"),
            price=Decimal(str(raw_product["price_gbp"])),
            currency=self.currency,
            stock_quantity=raw_product.get("stock_quantity", 0),
            in_stock=raw_product.get("in_stock", False),
            colour=raw_product.get("colour"),
            weight_kg=raw_product.get("weight_kg"),
            raw_data=raw_product,
        )
