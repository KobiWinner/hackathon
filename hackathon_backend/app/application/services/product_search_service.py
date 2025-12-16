"""Product Search Service using Elasticsearch."""

from decimal import Decimal
from typing import Any, Dict, List, Optional

import structlog

from app.core.infrastructure.elasticsearch import get_search_service
from app.domain.i_services.i_search_service import ISearchService
from app.domain.schemas.products.product_search import (
    ProductSearchRequest,
    ProductSearchResponse,
    ProductSearchResult,
)

logger = structlog.get_logger(__name__)

# Index name for products
PRODUCTS_INDEX = "products"

# Elasticsearch index mapping for products
PRODUCTS_MAPPING = {
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "text", "analyzer": "standard"},
        "slug": {"type": "keyword"},
        "brand": {"type": "keyword"},
        "category_id": {"type": "integer"},
        "category_name": {"type": "text", "analyzer": "standard"},
        "gender": {"type": "keyword"},
        "description": {"type": "text", "analyzer": "standard"},
        "image_url": {"type": "keyword", "index": False},
        "lowest_price": {"type": "float"},
        "original_price": {"type": "float"},
        "currency_code": {"type": "keyword"},
        "in_stock": {"type": "boolean"},
        # Denormalized variant attributes for search
        "colors": {"type": "text", "analyzer": "standard"},
        "sizes": {"type": "keyword"},
        "materials": {"type": "text", "analyzer": "standard"},
        "variant_attributes": {"type": "text", "analyzer": "standard"},
    }
}


class ProductSearchService:
    """
    Product Search Service.
    Elasticsearch üzerinden ürün arama işlemleri.
    """

    def __init__(self, search_service: Optional[ISearchService] = None) -> None:
        self._search_service = search_service

    @property
    def search(self) -> ISearchService:
        """Lazy load search service."""
        if self._search_service is None:
            self._search_service = get_search_service()
        return self._search_service

    async def ensure_index(self) -> bool:
        """Index'in var olduğundan emin ol, yoksa oluştur."""
        if not await self.search.index_exists(PRODUCTS_INDEX):
            return await self.search.create_index(
                PRODUCTS_INDEX,
                mappings=PRODUCTS_MAPPING,
            )
        return True

    async def index_product(self, product: Dict[str, Any]) -> bool:
        """Tek bir ürünü indexle."""
        doc_id = str(product.get("id", ""))
        return await self.search.index_document(PRODUCTS_INDEX, doc_id, product)

    async def bulk_index_products(self, products: List[Dict[str, Any]]) -> int:
        """Toplu ürün indexle."""
        return await self.search.bulk_index(PRODUCTS_INDEX, products, id_field="id")

    async def search_products(
        self, request: ProductSearchRequest
    ) -> ProductSearchResponse:
        """
        Ürün arama.

        Multi-match query ile name, description, brand ve category_name
        alanlarında arama yapar.
        """
        # Build the query
        must_clauses: List[Dict[str, Any]] = []
        filter_clauses: List[Dict[str, Any]] = []

        # Main search query - multi_match on text fields including variants
        if request.q:
            must_clauses.append({
                "multi_match": {
                    "query": request.q,
                    "fields": [
                        "name^3",
                        "brand^2",
                        "category_name",
                        "description",
                        "colors^2",
                        "materials",
                        "variant_attributes",
                    ],
                    "type": "best_fields",
                    "fuzziness": "AUTO",
                }
            })

        # Filters
        if request.category_id:
            filter_clauses.append({"term": {"category_id": request.category_id}})

        if request.brand:
            filter_clauses.append({"term": {"brand": request.brand}})

        if request.gender:
            filter_clauses.append({"term": {"gender": request.gender}})

        if request.in_stock_only:
            filter_clauses.append({"term": {"in_stock": True}})

        if request.min_price is not None:
            filter_clauses.append({
                "range": {"lowest_price": {"gte": float(request.min_price)}}
            })

        if request.max_price is not None:
            filter_clauses.append({
                "range": {"lowest_price": {"lte": float(request.max_price)}}
            })

        # Build final query
        query: Dict[str, Any]
        if must_clauses or filter_clauses:
            query = {
                "bool": {
                    "must": must_clauses if must_clauses else [{"match_all": {}}],
                    "filter": filter_clauses,
                }
            }
        else:
            query = {"match_all": {}}

        # Calculate offset
        from_ = (request.page - 1) * request.page_size

        # Sort by price ascending (lowest first)
        sort = [{"lowest_price": {"order": "asc"}}]

        # Execute search
        result = await self.search.search(
            index=PRODUCTS_INDEX,
            query=query,
            from_=from_,
            size=request.page_size,
            sort=sort,
        )

        # Map results to response
        products = []
        for hit in result.get("hits", []):
            try:
                products.append(ProductSearchResult(
                    id=hit.get("id", 0),
                    name=hit.get("name", ""),
                    slug=hit.get("slug"),
                    brand=hit.get("brand"),
                    category_id=hit.get("category_id"),
                    category_name=hit.get("category_name"),
                    gender=hit.get("gender"),
                    image_url=hit.get("image_url"),
                    description=hit.get("description"),
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
                    colors=hit.get("colors", []),
                    sizes=hit.get("sizes", []),
                    materials=hit.get("materials", []),
                ))
            except Exception as e:
                logger.warning("Failed to parse search hit", error=str(e), hit=hit)
                continue

        return ProductSearchResponse(
            query=request.q,
            products=products,
            total=result.get("total", 0),
            page=request.page,
            page_size=request.page_size,
        )

    async def delete_product(self, product_id: int) -> bool:
        """Ürünü index'ten sil."""
        return await self.search.delete_document(PRODUCTS_INDEX, str(product_id))


# Factory function
def get_product_search_service() -> ProductSearchService:
    """Returns ProductSearchService instance."""
    return ProductSearchService()
