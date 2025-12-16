from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ProductAnalyticsBase(BaseModel):
    product_id: Optional[int] = None
    current_trend_score: int = 0
    market_average_price: Optional[Decimal] = None
    market_min_price: Optional[Decimal] = None
    market_max_price: Optional[Decimal] = None
    total_views: int = 0
    total_favorites: int = 0