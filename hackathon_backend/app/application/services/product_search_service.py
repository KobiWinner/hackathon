"""Product Search Service using PostgreSQL database."""

from decimal import Decimal
from typing import List, Optional

import structlog
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.domain.schemas.products.product_search import (
    ProductSearchRequest,
    ProductSearchResponse,
    ProductSearchResult,
)
from app.persistence.db.session import AsyncSessionLocal
from app.persistence.models.products.product import Product
from app.persistence.models.products.product_mappings import ProductMapping
from app.persistence.models.price.price_history import PriceHistory

logger = structlog.get_logger(__name__)


class ProductSearchService:
    """
    Product Search Service.
    PostgreSQL veritabanı üzerinden basit ürün arama işlemleri.
    ILIKE ile isim bazlı arama yapar.
    """

    async def ensure_index(self) -> bool:
        """No-op: Database araması için index gerekmez."""
        return True

    async def search_products(
        self, request: ProductSearchRequest
    ) -> ProductSearchResponse:
        """
        Ürün arama.
        
        PostgreSQL ILIKE ile name alanında arama yapar.
        """
        async with AsyncSessionLocal() as session:
            # Base query
            query = select(Product).options(
                selectinload(Product.category),
                selectinload(Product.variants),
            )

            # Search filter
            if request.q and request.q.strip() != "*":
                search_term = f"%{request.q.strip()}%"
                query = query.where(
                    or_(
                        Product.name.ilike(search_term),
                        Product.description.ilike(search_term),
                        Product.brand.ilike(search_term),
                    )
                )

            # Category filter
            if request.category_id:
                query = query.where(Product.category_id == request.category_id)

            # Brand filter
            if request.brand:
                query = query.where(Product.brand == request.brand)

            # Gender filter
            if request.gender:
                query = query.where(Product.gender == request.gender)

            # Get total count
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await session.execute(count_query)
            total = total_result.scalar() or 0

            # Pagination
            offset = (request.page - 1) * request.page_size
            query = query.offset(offset).limit(request.page_size)

            # Order by name
            query = query.order_by(Product.name)

            # Execute
            result = await session.execute(query)
            products_db = result.scalars().all()

            # Get lowest prices for each product
            products: List[ProductSearchResult] = []
            for product in products_db:
                # Get lowest price from price_histories via product_mappings
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

                # Price filter (post-filter since we need to calculate lowest price first)
                if request.min_price is not None and lowest_price is not None:
                    if lowest_price < request.min_price:
                        continue
                if request.max_price is not None and lowest_price is not None:
                    if lowest_price > request.max_price:
                        continue
                if request.in_stock_only and not in_stock:
                    continue

                # Calculate discount
                discount_pct = None
                if original_price and lowest_price and original_price > lowest_price:
                    discount_pct = int(((original_price - lowest_price) / original_price) * 100)

                # Extract colors and sizes from variants
                colors: List[str] = []
                sizes: List[str] = []
                if product.variants:
                    for v in product.variants:
                        attrs = v.attributes or {}
                        if attrs.get("color"):
                            colors.append(str(attrs["color"]))
                        if attrs.get("size"):
                            sizes.append(str(attrs["size"]))

                products.append(ProductSearchResult(
                    id=product.id,
                    name=product.name,
                    slug=product.slug,
                    brand=product.brand,
                    category_id=product.category_id,
                    category_name=product.category.name if product.category else None,
                    gender=product.gender,
                    image_url=product.image_url,
                    description=product.description,
                    lowest_price=lowest_price,
                    original_price=original_price,
                    currency_code="TRY",
                    in_stock=in_stock,
                    colors=list(set(colors)),
                    sizes=list(set(sizes)),
                    materials=[],
                    discount_percentage=discount_pct,
                ))

            return ProductSearchResponse(
                query=request.q,
                products=products,
                total=total,
                page=request.page,
                page_size=request.page_size,
            )

    async def get_product_by_id(self, product_id: int) -> Optional[ProductSearchResult]:
        """ID ile ürün getir."""
        async with AsyncSessionLocal() as session:
            query = (
                select(Product)
                .options(
                    selectinload(Product.category),
                    selectinload(Product.variants),
                )
                .where(Product.id == product_id)
            )
            result = await session.execute(query)
            product = result.scalars().first()

            if not product:
                return None

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

            # Calculate discount
            discount_pct = None
            if original_price and lowest_price and original_price > lowest_price:
                discount_pct = int(((original_price - lowest_price) / original_price) * 100)

            # Extract colors and sizes
            colors: List[str] = []
            sizes: List[str] = []
            if product.variants:
                for v in product.variants:
                    attrs = v.attributes or {}
                    if attrs.get("color"):
                        colors.append(str(attrs["color"]))
                    if attrs.get("size"):
                        sizes.append(str(attrs["size"]))

            return ProductSearchResult(
                id=product.id,
                name=product.name,
                slug=product.slug,
                brand=product.brand,
                category_id=product.category_id,
                category_name=product.category.name if product.category else None,
                gender=product.gender,
                image_url=product.image_url,
                description=product.description,
                lowest_price=lowest_price,
                original_price=original_price,
                currency_code="TRY",
                in_stock=in_stock,
                colors=list(set(colors)),
                sizes=list(set(sizes)),
                materials=[],
                discount_percentage=discount_pct,
            )


# Factory function
def get_product_search_service() -> ProductSearchService:
    """Returns ProductSearchService instance."""
    return ProductSearchService()
