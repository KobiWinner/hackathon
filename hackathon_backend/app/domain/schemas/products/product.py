from typing import Optional

from pydantic import BaseModel


class ProductBase(BaseModel):
    category_id: Optional[int] = None
    name: str
    slug: Optional[str] = None
    brand: Optional[str] = None
    gender: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True