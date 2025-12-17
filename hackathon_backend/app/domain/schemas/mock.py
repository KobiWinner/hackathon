"""
Mock Provider Response Schemas.
Standardized response format for all mock providers.
"""
from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict

from app.domain.schemas.product import UnifiedProduct


class MockProviderResponse(BaseModel):
    """Standardized response for all mock providers."""
    provider: str
    currency: str
    total_products: int
    timestamp: str
    products: List[UnifiedProduct]
    
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def create(
        cls, 
        provider: str, 
        currency: str, 
        products: List[UnifiedProduct]
    ) -> "MockProviderResponse":
        """Factory method to create a response."""
        return cls(
            provider=provider,
            currency=currency,
            total_products=len(products),
            timestamp=datetime.utcnow().isoformat(),
            products=products
        )
