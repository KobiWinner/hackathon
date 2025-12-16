"""Product search API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.application.services.product_search_service import (
    ProductSearchService,
    get_product_search_service,
)
from app.domain.schemas.products.product_search import (
    ProductSearchRequest,
    ProductSearchResponse,
)

router = APIRouter()


@router.get("/search", response_model=ProductSearchResponse)
async def search_products(
    q: str = Query(..., min_length=1, description="Arama metni"),
    category_id: Optional[int] = Query(None, description="Kategori ID filtresi"),
    brand: Optional[str] = Query(None, description="Marka filtresi"),
    gender: Optional[str] = Query(None, description="Cinsiyet filtresi"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum fiyat"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum fiyat"),
    in_stock_only: bool = Query(True, description="Sadece stokta olanlar"),
    page: int = Query(1, ge=1, description="Sayfa numarası"),
    page_size: int = Query(20, ge=1, le=100, description="Sayfa başına ürün"),
    search_service: ProductSearchService = Depends(get_product_search_service),
) -> ProductSearchResponse:
    """
    Ürün arama endpoint'i.

    Elasticsearch üzerinden ürün arar ve en düşük fiyatla birlikte döner.
    Sonuçlar fiyata göre artan sırada sıralanır.
    """
    from decimal import Decimal

    request = ProductSearchRequest(
        q=q,
        category_id=category_id,
        brand=brand,
        gender=gender,
        min_price=Decimal(str(min_price)) if min_price is not None else None,
        max_price=Decimal(str(max_price)) if max_price is not None else None,
        in_stock_only=in_stock_only,
        page=page,
        page_size=page_size,
    )

    return await search_service.search_products(request)


@router.post("/search/reindex")
async def reindex_products(
    search_service: ProductSearchService = Depends(get_product_search_service),
) -> dict:
    """
    Ürün index'ini yeniden oluştur.

    Not: Bu endpoint admin yetkisi gerektirir (şimdilik açık).
    """
    # Ensure index exists
    await search_service.ensure_index()

    return {"status": "ok", "message": "Index is ready"}
