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


class ProductMappingCreate(ProductMappingBase):
    """Yeni product mapping oluşturmak için."""

    pass


class ProductMappingUpdate(BaseModel):
    """Product mapping güncellemek için (opsiyonel alanlar)."""

    product_id: Optional[int] = None
    estimated_profit_margin: Optional[Decimal] = None
    is_arbitrage_opportunity: Optional[bool] = None
    product_url: Optional[str] = None


class ProductMapping(ProductMappingBase):
    """Product mapping response model."""

    id: int

    class Config:
        from_attributes = True