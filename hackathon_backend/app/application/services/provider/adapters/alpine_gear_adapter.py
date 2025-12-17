from typing import Dict, Any, List
from decimal import Decimal

from .base_adapter import BaseProviderAdapter
from ..dto.provider_product_dto import ProviderProductDTO


class AlpineGearAdapter(BaseProviderAdapter):
    """
    AlpineGear API response adapter (Almanca format).
    
    Response format:
    {
        "anbieter": "AlpineGear",
        "waehrung": "EUR",
        "produkte": [
            {
                "artikel_id": 1,
                "produktname": "Mammut Nordwand Pro HS",
                "marke": "Mammut",
                "kategorie": "Bekleidung",
                "unterkategorie": "Jacken",
                "farbe": "Rot",
                "gewicht_kg": 0.65,
                "preis": 599.95,
                "lagerbestand": 23,
                "verfuegbar": true
            }
        ]
    }
    """
    
    @property
    def provider_name(self) -> str:
        return "alpine-gear"
    
    @property
    def currency(self) -> str:
        return "EUR"
    
    def _extract_products_list(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        return response.get("produkte", [])
    
    def adapt_product(self, raw_product: Dict[str, Any]) -> ProviderProductDTO:
        return ProviderProductDTO(
            external_id=str(raw_product["artikel_id"]),
            provider_name=self.provider_name,
            name=raw_product["produktname"],
            brand=raw_product["marke"],
            category=raw_product["kategorie"],
            subcategory=raw_product.get("unterkategorie"),
            price=Decimal(str(raw_product["preis"])),
            currency=self.currency,
            stock_quantity=raw_product.get("lagerbestand", 0),
            in_stock=raw_product.get("verfuegbar", False),
            colour=raw_product.get("farbe"),
            weight_kg=raw_product.get("gewicht_kg"),
            raw_data=raw_product,
        )
