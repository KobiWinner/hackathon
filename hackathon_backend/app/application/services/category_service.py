"""Category Service for business logic - uses PostgreSQL database."""

from decimal import Decimal
from typing import List, Optional

import structlog
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.domain.schemas.products.category import (
    CategoryResponse,
    CategoryWithChildrenResponse,
    CategoryWithProductsResponse,
    ProductSearchResultSimple,
)
from app.infrastructure.unit_of_work import UnitOfWork
from app.persistence.db.session import AsyncSessionLocal
from app.persistence.models.products.product import Product
from app.persistence.models.products.product_mappings import ProductMapping
from app.persistence.models.price.price_history import PriceHistory

logger = structlog.get_logger(__name__)


class CategoryService:
    """
    Category Service.
    Handles category business logic and product fetching via PostgreSQL.
    """

    def __init__(self, uow: UnitOfWork) -> None:
        self.uow = uow

    async def get_category_with_products(
        self,
        identifier: str,
        page: int = 1,
        page_size: int = 20,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        brand: Optional[str] = None,
        in_stock_only: bool = True,
    ) -> Optional[CategoryWithProductsResponse]:
        """
        Get category details with products from database.
        """
        async with self.uow:
            # Get category
            category = await self.uow.categories.get_by_id_or_slug(identifier)
            if not category:
                return None

        # Get products from database
        async with AsyncSessionLocal() as session:
            # Base query for products in this category
            query = (
                select(Product)
                .where(Product.category_id == category.id)
            )

            # Brand filter
            if brand:
                query = query.where(Product.brand == brand)

            # Get total count
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await session.execute(count_query)
            total = total_result.scalar() or 0

            # Pagination
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size).order_by(Product.name)

            # Execute
            result = await session.execute(query)
            products_db = result.scalars().all()

            # Get lowest prices and build response
            products: List[ProductSearchResultSimple] = []
            for product in products_db:
                # Get lowest price
                price_query = (
                    select(PriceHistory.price, PriceHistory.original_price, PriceHistory.in_stock)
                    .join(ProductMapping, PriceHistory.mapping_id == ProductMapping.id)
                    .where(ProductMapping.product_id == product.id)
                    .order_by(PriceHistory.price)
                    .limit(1)
                )
                price_result = await session.execute(price_query)
                price_row = price_result.first()

                lowest_price = Decimal(str(price_row[0])) if price_row else None
                original_price = Decimal(str(price_row[1])) if price_row and price_row[1] else None
                in_stock = price_row[2] if price_row else True

                # Apply filters
                if min_price is not None and lowest_price is not None:
                    if lowest_price < min_price:
                        continue
                if max_price is not None and lowest_price is not None:
                    if lowest_price > max_price:
                        continue
                if in_stock_only and not in_stock:
                    continue

                products.append(
                    ProductSearchResultSimple(
                        id=product.id,
                        name=product.name,
                        slug=product.slug,
                        brand=product.brand,
                        image_url=product.image_url,
                        lowest_price=lowest_price,
                        original_price=original_price,
                        currency_code="TRY",
                        in_stock=in_stock,
                    )
                )

            return CategoryWithProductsResponse(
                category=category,
                products=products,
                total=total,
                page=page,
                page_size=page_size,
            )

    async def get_all_categories(self) -> List[CategoryResponse]:
        """Get all categories."""
        async with self.uow:
            return await self.uow.categories.get_all()

    async def get_category_tree(self) -> List[CategoryWithChildrenResponse]:
        """Get full category tree with nested children."""
        async with self.uow:
            return await self.uow.categories.get_tree()

    async def get_category(self, identifier: str) -> Optional[CategoryResponse]:
        """Get category by ID or slug."""
        async with self.uow:
            return await self.uow.categories.get_by_id_or_slug(identifier)


def get_category_service(uow: UnitOfWork) -> CategoryService:
    """Factory function for CategoryService."""
    return CategoryService(uow)
