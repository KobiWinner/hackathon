from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ProductMappingBase(BaseModel):
    product_id: Optional[int] = None
    provider_id: Optional[int] = None
    external_product_code: str
    estimated_profit_margin: Optional[Decimal] = None
    is_arbitrage_opportunity: bool = False
    product_url: Optional[str] = None