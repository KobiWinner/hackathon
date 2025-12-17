"""Category Service for business logic and Elasticsearch integration."""

from decimal import Decimal
from typing import Any, Dict, List, Optional

import structlog

from app.application.services.product_search_service import (
    PRODUCTS_INDEX,
    ProductSearchService,
)
from app.domain.schemas.products.category import (
    CategoryResponse,
    CategoryWithChildrenResponse,
    CategoryWithProductsResponse,
    ProductSearchResultSimple,
)
from app.infrastructure.unit_of_work import UnitOfWork

logger = structlog.get_logger(__name__)


class CategoryService:
    """
    Category Service.
    Handles category business logic and product fetching via Elasticsearch.
    """

    def __init__(
        self,
        uow: UnitOfWork,
        search_service: Optional[ProductSearchService] = None,
    ) -> None:
        self.uow = uow
        self._search_service = search_service

    @property
    def search(self) -> ProductSearchService:
        """Lazy load search service."""
        if self._search_service is None:
            self._search_service = ProductSearchService()
        return self._search_service

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
        Get category details with products from Elasticsearch.

        Args:
            identifier: Category ID or slug
            page: Page number (1-indexed)
            page_size: Number of products per page
            min_price: Minimum price filter
            max_price: Maximum price filter
            brand: Brand filter
            in_stock_only: Only show in-stock products

        Returns:
            CategoryWithProductsResponse or None if category not found
        """
        async with self.uow:
            # Get category
            category = await self.uow.categories.get_by_id_or_slug(identifier)
            if not category:
                return None

            # Build Elasticsearch query
            filter_clauses: List[Dict[str, Any]] = [
                {"term": {"category_id": category.id}}
            ]

            if brand:
                filter_clauses.append({"term": {"brand": brand}})

            if in_stock_only:
                filter_clauses.append({"term": {"in_stock": True}})

            if min_price is not None:
                filter_clauses.append(
                    {"range": {"lowest_price": {"gte": float(min_price)}}}
                )

            if max_price is not None:
                filter_clauses.append(
                    {"range": {"lowest_price": {"lte": float(max_price)}}}
                )

            query: Dict[str, Any] = {
                "bool": {
                    "must": [{"match_all": {}}],
                    "filter": filter_clauses,
                }
            }

            # Calculate offset
            from_ = (page - 1) * page_size

            # Sort by price ascending
            sort = [{"lowest_price": {"order": "asc"}}]

            # Execute search
            result = await self.search.search.search(
                index=PRODUCTS_INDEX,
                query=query,
                from_=from_,
                size=page_size,
                sort=sort,
            )

            # Map results
            products = []
            for hit in result.get("hits", []):
                try:
                    products.append(
                        ProductSearchResultSimple(
                            id=hit.get("id", 0),
                            name=hit.get("name", ""),
                            slug=hit.get("slug"),
                            brand=hit.get("brand"),
                            image_url=hit.get("image_url"),
                            lowest_price=(
                                Decimal(str(hit["lowest_price"]))
                                if hit.get("lowest_price")
                                else None
                            ),
                            original_price=(
                                Decimal(str(hit["original_price"]))
                                if hit.get("original_price")
                                else None
                            ),
                            currency_code=hit.get("currency_code", "TRY"),
                            in_stock=hit.get("in_stock", True),
                        )
                    )
                except Exception as e:
                    logger.warning(
                        "Failed to parse product hit", error=str(e), hit=hit
                    )
                    continue

            total = result.get("total", 0)

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
