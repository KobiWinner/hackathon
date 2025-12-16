"""Product search response schemas."""

from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, computed_field


class ProductSearchResult(BaseModel):
    """Arama sonucu ürün bilgisi."""

    id: int
    name: str
    slug: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    gender: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    lowest_price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    currency_code: str = "TRY"
    in_stock: bool = True
    # Variant attributes (denormalized)
    colors: List[str] = []
    sizes: List[str] = []
    materials: List[str] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def discount_percentage(self) -> Optional[int]:
        """İndirim yüzdesini hesaplar."""
        if (
            self.original_price
            and self.lowest_price
            and self.original_price > self.lowest_price
        ):
            discount = (
                (self.original_price - self.lowest_price) / self.original_price
            ) * 100
            return int(discount)
        return None

    class Config:
        from_attributes = True


class ProductSearchResponse(BaseModel):
    """Ürün arama response."""

    query: str
    products: list[ProductSearchResult]
    total: int
    page: int
    page_size: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def total_pages(self) -> int:
        """Toplam sayfa sayısı."""
        if self.page_size <= 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size


class ProductSearchRequest(BaseModel):
    """Ürün arama request parametreleri."""

    q: str  # Arama metni
    category_id: Optional[int] = None
    brand: Optional[str] = None
    gender: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    in_stock_only: bool = True
    page: int = 1
    page_size: int = 20
