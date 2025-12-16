from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ProviderBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    base_url: Optional[str] = None
    logo_url: Optional[str] = None
    rating: Decimal = Decimal(0)
    review_count: int = 0
    total_sales_count: int = 0
    response_rate: Optional[int] = None
    is_verified: bool = False
    is_active: bool = True
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = "Turkey"
    reliability_score: Decimal = Decimal("1.00")
    data_quality_score: Optional[int] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None