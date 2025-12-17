"""Product Query Service for comprehensive product details."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.schemas.products.product_full_detail import (
    CategoryInfo,
    PriceHistoryPoint,
    ProductFullDetailResponse,
    ProviderPrice,
    VariantInfo,
)
from app.persistence.models import (
    Category,
    PriceHistory,
    Product,
    ProductMapping,
    ProductVariant,
)
from app.persistence.models.providers.provider import Provider


class ProductQueryService:
    """Service for querying comprehensive product details."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_product_full_detail(
        self, product_id: int
    ) -> Optional[ProductFullDetailResponse]:
        """
        Fetch comprehensive product details:
        - Product info
        - All provider prices (current)
        - Price history (last 30 days)
        - Variants
        """
        # 1. Fetch Product with Category and Variants
        query = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.variants),
            )
            .where(Product.id == product_id)
        )
        result = await self.db.execute(query)
        product = result.scalars().first()

        if not product:
            return None

        # 2. Fetch all ProductMappings with Provider for this product
        mappings_query = (
            select(ProductMapping)
            .options(selectinload(ProductMapping.provider))
            .where(ProductMapping.product_id == product_id)
        )
        mappings_result = await self.db.execute(mappings_query)
        mappings = mappings_result.scalars().all()

        # 3. For each mapping, get the latest price
        provider_prices: List[ProviderPrice] = []
        best_price: Optional[Decimal] = None

        for mapping in mappings:
            # Get latest price for this mapping
            latest_price_query = (
                select(PriceHistory)
                .where(PriceHistory.mapping_id == mapping.id)
                .order_by(desc(PriceHistory.created_at))
                .limit(1)
            )
            price_result = await self.db.execute(latest_price_query)
            latest_price = price_result.scalars().first()

            if latest_price and mapping.provider:
                provider = mapping.provider
                current_price = Decimal(str(latest_price.price))
                original_price = (
                    Decimal(str(latest_price.original_price))
                    if latest_price.original_price
                    else None
                )

                # Calculate discount
                discount_pct = None
                if original_price and original_price > current_price:
                    discount_pct = int(
                        ((original_price - current_price) / original_price) * 100
                    )

                provider_prices.append(
                    ProviderPrice(
                        provider_id=provider.id,
                        provider_name=provider.name,
                        provider_slug=provider.slug,
                        logo_url=provider.logo_url,
                        rating=Decimal(str(provider.rating)) if provider.rating else Decimal("0"),
                        is_verified=provider.is_verified,
                        current_price=current_price,
                        original_price=original_price,
                        discount_percentage=discount_pct,
                        in_stock=latest_price.in_stock,
                        product_url=mapping.product_url,
                        last_updated=latest_price.created_at,
                    )
                )

                # Track best price
                if best_price is None or current_price < best_price:
                    best_price = current_price

        # Sort by price (cheapest first)
        provider_prices.sort(key=lambda x: x.current_price)

        # 4. Fetch price history (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        history_query = (
            select(PriceHistory)
            .join(ProductMapping, PriceHistory.mapping_id == ProductMapping.id)
            .options(selectinload(PriceHistory.mapping).selectinload(ProductMapping.provider))
            .where(
                ProductMapping.product_id == product_id,
                PriceHistory.created_at >= thirty_days_ago,
            )
            .order_by(PriceHistory.created_at)
        )
        history_result = await self.db.execute(history_query)
        history_records = history_result.scalars().all()

        price_history: List[PriceHistoryPoint] = []
        for record in history_records:
            provider_name = None
            if record.mapping and record.mapping.provider:
                provider_name = record.mapping.provider.name

            price_history.append(
                PriceHistoryPoint(
                    date=record.created_at,
                    price=Decimal(str(record.price)),
                    provider_id=record.mapping.provider_id if record.mapping else 0,
                    provider_name=provider_name,
                )
            )

        # 5. Process Variants
        variants: List[VariantInfo] = []
        colors: set[str] = set()
        sizes: set[str] = set()

        if product.variants:
            for v in product.variants:
                attrs = v.attributes or {}
                color = attrs.get("color")
                size = attrs.get("size")
                material = attrs.get("material")

                if color:
                    colors.add(str(color))
                if size:
                    sizes.add(str(size))

                variants.append(
                    VariantInfo(
                        id=v.id,
                        sku=v.sku,
                        color=str(color) if color else None,
                        size=str(size) if size else None,
                        material=str(material) if material else None,
                    )
                )

        # 6. Build category info
        category_info = None
        if product.category:
            category_info = CategoryInfo(
                id=product.category.id,
                name=product.category.name,
                slug=product.category.slug,
            )

        # 7. Build response
        return ProductFullDetailResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            brand=product.brand,
            description=product.description,
            image_url=product.image_url,
            gender=product.gender,
            category=category_info,
            provider_prices=provider_prices,
            best_price=best_price,
            provider_count=len(provider_prices),
            price_history=price_history,
            variants=variants,
            available_colors=list(colors),
            available_sizes=list(sizes),
        )
