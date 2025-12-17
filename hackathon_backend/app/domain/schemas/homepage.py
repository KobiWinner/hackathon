"""Homepage schemas for aggregate response."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class TrendingProductItem(BaseModel):
    """Single trending product item."""
    rank: int
    product_id: int
    name: str
    slug: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    trend_score: int  # -100 to +100
    trend_direction: str  # up, down, stable
    best_price: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


class HomepageResponse(BaseModel):
    """
    Aggregate response for homepage.
    Contains all data needed for the homepage in a single request.
    """
    trending: List[TrendingProductItem] = []
    # Future: categories, featured, etc.
    cached_at: Optional[datetime] = None
