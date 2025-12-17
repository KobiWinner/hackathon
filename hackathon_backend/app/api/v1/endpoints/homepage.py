"""Homepage endpoint for aggregate data."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_cache_service, get_uow
from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.homepage import HomepageResponse, TrendingProductItem
from app.infrastructure.unit_of_work import UnitOfWork
from app.persistence.models.analytics.trending_product import TrendingProduct
from app.persistence.models.products.product_mappings import ProductMapping
from app.persistence.models.price.price_history import PriceHistory

router = APIRouter()

CACHE_KEY = "homepage:data"
CACHE_TTL = 300  # 5 minutes


@router.get("", response_model=HomepageResponse)
async def get_homepage(
    uow: UnitOfWork = Depends(get_uow),
    cache: ICacheService = Depends(get_cache_service),
) -> HomepageResponse:
    """
    Ana sayfa için aggregate data döndürür.
    
    - trending: Top 5 trending products
    - (future) categories, featured, etc.
    
    Cache TTL: 5 dakika
    """
    # 1. Try cache first
    cached = await cache.get(CACHE_KEY)
    if cached:
        return HomepageResponse(**cached)

    # 2. Fetch from database
    async with uow:
        # Get trending products with product info
        query = (
            select(TrendingProduct)
            .options(selectinload(TrendingProduct.product))
            .order_by(TrendingProduct.rank)
        )
        result = await uow.db.execute(query)
        trending_records = result.scalars().all()

        # Build response items
        trending_items: List[TrendingProductItem] = []
        
        for record in trending_records:
            product = record.product
            if not product:
                continue

            # Determine trend direction from score
            if record.trend_score > 0:
                direction = "up"
            elif record.trend_score < 0:
                direction = "down"
            else:
                direction = "stable"

            # Get best price for this product (optional enhancement)
            best_price = None
            price_query = (
                select(PriceHistory.price)
                .join(ProductMapping, PriceHistory.mapping_id == ProductMapping.id)
                .where(
                    ProductMapping.product_id == product.id,
                    PriceHistory.in_stock == True,  # noqa: E712
                )
                .order_by(PriceHistory.price)
                .limit(1)
            )
            price_result = await uow.db.execute(price_query)
            price_row = price_result.scalar()
            if price_row:
                best_price = price_row

            trending_items.append(
                TrendingProductItem(
                    rank=record.rank,
                    product_id=product.id,
                    name=product.name,
                    slug=product.slug,
                    brand=product.brand,
                    image_url=product.image_url,
                    trend_score=record.trend_score,
                    trend_direction=direction,
                    best_price=best_price,
                )
            )

        response = HomepageResponse(
            trending=trending_items,
            cached_at=datetime.now(timezone.utc),
        )

    # 3. Cache the result
    await cache.set(CACHE_KEY, response.model_dump(mode="json"), expire=CACHE_TTL)

    return response
