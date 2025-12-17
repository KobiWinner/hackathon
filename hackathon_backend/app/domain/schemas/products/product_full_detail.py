"""Comprehensive product detail schemas for frontend."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class CategoryInfo(BaseModel):
    """Category information."""
    id: int
    name: str
    slug: Optional[str] = None


class VariantInfo(BaseModel):
    """Variant summary."""
    id: int
    sku: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    material: Optional[str] = None


class ProviderPrice(BaseModel):
    """Price from a specific provider/seller."""
    provider_id: int
    provider_name: str
    provider_slug: Optional[str] = None
    logo_url: Optional[str] = None
    rating: Decimal = Decimal("0")
    is_verified: bool = False
    
    # Price info
    current_price: Decimal
    original_price: Optional[Decimal] = None
    discount_percentage: Optional[int] = None
    currency_code: str = "TRY"
    in_stock: bool = True
    
    # Link to buy
    product_url: Optional[str] = None
    last_updated: Optional[datetime] = None


class PriceHistoryPoint(BaseModel):
    """Single point in price history for charts."""
    date: datetime
    price: Decimal
    provider_id: int
    provider_name: Optional[str] = None


class ProductFullDetailResponse(BaseModel):
    """Comprehensive product detail for frontend."""
    
    # Basic product info
    id: int
    name: str
    slug: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    gender: Optional[str] = None
    
    # Category
    category: Optional[CategoryInfo] = None
    
    # All provider prices (sorted by price)
    provider_prices: List[ProviderPrice] = []
    best_price: Optional[Decimal] = None
    provider_count: int = 0
    
    # Price history for chart (last 30 days)
    price_history: List[PriceHistoryPoint] = []
    
    # Variants
    variants: List[VariantInfo] = []
    available_colors: List[str] = []
    available_sizes: List[str] = []
    
    class Config:
        from_attributes = True
