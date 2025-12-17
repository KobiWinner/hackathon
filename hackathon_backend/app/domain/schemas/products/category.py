"""Category schemas for API requests and responses."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from pydantic import BaseModel, computed_field

if TYPE_CHECKING:
    from app.domain.schemas.products.product_search import ProductSearchResult


class CategoryBase(BaseModel):
    """Base category schema."""

    parent_id: Optional[int] = None
    name: str
    slug: Optional[str] = None


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""

    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""

    parent_id: Optional[int] = None
    name: Optional[str] = None
    slug: Optional[str] = None


class CategoryResponse(BaseModel):
    """Category response schema."""

    id: int
    name: str
    slug: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class CategoryWithChildrenResponse(CategoryResponse):
    """Category with nested children."""

    children: List[CategoryWithChildrenResponse] = []


class CategoryWithProductsResponse(BaseModel):
    """
    Category detail response with products.
    Main response for /categories/{identifier} endpoint.
    """

    category: CategoryResponse
    products: List["ProductSearchResultSimple"]
    total: int
    page: int
    page_size: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def total_pages(self) -> int:
        """Calculate total pages."""
        if self.page_size <= 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size


class ProductSearchResultSimple(BaseModel):
    """Simplified product result for category listing."""

    id: int
    name: str
    slug: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    lowest_price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    currency_code: str = "TRY"
    in_stock: bool = True

    @computed_field  # type: ignore[prop-decorator]
    @property
    def discount_percentage(self) -> Optional[int]:
        """Calculate discount percentage."""
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


# Update forward references
CategoryWithChildrenResponse.model_rebuild()
CategoryWithProductsResponse.model_rebuild()