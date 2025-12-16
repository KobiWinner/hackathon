from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class PriceHistoryBase(BaseModel):
    mapping_id: Optional[int] = None
    variant_id: Optional[int] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    discount_rate: Optional[int] = None
    currency_id: int
    in_stock: bool = True
    stock_quantity: Optional[int] = None


class PriceHistoryCreate(PriceHistoryBase):
    """Yeni fiyat geçmişi kaydı oluşturmak için."""

    pass


class PriceHistoryUpdate(BaseModel):
    """Fiyat geçmişi güncellemek için (opsiyonel alanlar)."""

    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    discount_rate: Optional[int] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None


class PriceHistory(PriceHistoryBase):
    """Fiyat geçmişi response model."""

    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True