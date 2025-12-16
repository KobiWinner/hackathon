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