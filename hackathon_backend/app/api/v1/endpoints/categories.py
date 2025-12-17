"""Category API endpoints."""

from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_uow
from app.application.services.category_service import CategoryService
from app.domain.schemas.products.category import (
    CategoryResponse,
    CategoryWithChildrenResponse,
    CategoryWithProductsResponse,
)
from app.infrastructure.unit_of_work import UnitOfWork

router = APIRouter()


def get_category_service(uow: UnitOfWork = Depends(get_uow)) -> CategoryService:
    """Dependency injection for CategoryService."""
    return CategoryService(uow)


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    service: CategoryService = Depends(get_category_service),
) -> List[CategoryResponse]:
    """
    Get all categories.

    Returns a flat list of all categories.
    """
    return await service.get_all_categories()


@router.get("/tree", response_model=List[CategoryWithChildrenResponse])
async def get_category_tree(
    service: CategoryService = Depends(get_category_service),
) -> List[CategoryWithChildrenResponse]:
    """
    Get category tree.

    Returns categories in a nested tree structure with parent-child relationships.
    Only root categories (parent_id=null) are returned at the top level,
    with their children nested inside.
    """
    return await service.get_category_tree()


@router.get("/{identifier}", response_model=CategoryWithProductsResponse)
async def get_category_with_products(
    identifier: str,
    page: int = Query(1, ge=1, description="Sayfa numarası"),
    page_size: int = Query(20, ge=1, le=100, description="Sayfa başına ürün"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum fiyat"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum fiyat"),
    brand: Optional[str] = Query(None, description="Marka filtresi"),
    in_stock_only: bool = Query(True, description="Sadece stokta olanlar"),
    service: CategoryService = Depends(get_category_service),
) -> CategoryWithProductsResponse:
    """
    Get category details with products.

    Supports both ID and slug as identifier.
    First tries to find by slug, then by ID if identifier is numeric.

    Examples:
    - /categories/elektronik (by slug)
    - /categories/5 (by ID)
    """
    result = await service.get_category_with_products(
        identifier=identifier,
        page=page,
        page_size=page_size,
        min_price=Decimal(str(min_price)) if min_price is not None else None,
        max_price=Decimal(str(max_price)) if max_price is not None else None,
        brand=brand,
        in_stock_only=in_stock_only,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{identifier}' not found",
        )

    return result
