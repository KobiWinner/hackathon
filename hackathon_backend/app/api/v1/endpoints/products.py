"""Product search API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.application.services.product_search_service import (
    ProductSearchService,
    get_product_search_service,
)
from app.domain.schemas.products.product_search import (
    ProductSearchRequest,
    ProductSearchResponse,
    ProductSearchResult,
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





from app.api.deps import get_uow
from app.application.cqrs.queries.product_query import ProductQueryService
from app.domain.schemas.products.product_full_detail import ProductFullDetailResponse
from app.infrastructure.unit_of_work import UnitOfWork


@router.get("/{product_id}", response_model=ProductFullDetailResponse)
async def get_product_full_detail(
    product_id: int,
    uow: UnitOfWork = Depends(get_uow),
) -> ProductFullDetailResponse:
    """
    Kapsamlı ürün detayı endpoint'i.
    
    Döndürür:
    - Ürün bilgileri
    - Tüm satıcı fiyatları (en ucuzdan pahalıya)
    - Fiyat geçmişi (son 30 gün)
    - Varyantlar ve renk/beden seçenekleri
    """
    async with uow:
        query_service = ProductQueryService(uow.db)
        product = await query_service.get_product_full_detail(product_id)
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Ürün bulunamadı"
            )
        return product


