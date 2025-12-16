"""Elasticsearch Service Implementation."""

from typing import Any, Dict, List, Optional

import structlog
from elasticsearch import AsyncElasticsearch
from elasticsearch.helpers import async_bulk

from app.core.config.settings import settings
from app.domain.i_services.i_search_service import ISearchService

logger = structlog.get_logger(__name__)


class ElasticsearchService(ISearchService):
    """
    Elasticsearch Service Implementation.
    Elastic Cloud veya self-hosted ES ile çalışır.
    """

    def __init__(self) -> None:
        self._client: Optional[AsyncElasticsearch] = None

    @property
    def client(self) -> AsyncElasticsearch:
        """Lazy initialization of ES client."""
        if self._client is None:
            self._client = self._create_client()
        return self._client

    def _create_client(self) -> AsyncElasticsearch:
        """Creates ES client based on settings."""
        # Elastic Cloud connection (preferred)
        if settings.ELASTICSEARCH_CLOUD_ID and settings.ELASTICSEARCH_API_KEY:
            return AsyncElasticsearch(
                cloud_id=settings.ELASTICSEARCH_CLOUD_ID,
                api_key=settings.ELASTICSEARCH_API_KEY,
            )
        # Self-hosted connection
        elif settings.ELASTICSEARCH_URL:
            return AsyncElasticsearch(hosts=[settings.ELASTICSEARCH_URL])
        else:
            raise ValueError(
                "Elasticsearch configuration is missing. "
                "Set ELASTICSEARCH_CLOUD_ID + ELASTICSEARCH_API_KEY or URL"
            )

    def _get_index_name(self, index: str) -> str:
        """Adds prefix to index name if configured."""
        prefix = settings.ELASTICSEARCH_INDEX_PREFIX
        if prefix:
            return f"{prefix}_{index}"
        return index

    async def index_document(
        self,
        index: str,
        doc_id: str,
        document: Dict[str, Any],
    ) -> bool:
        """Tek bir dokümanı indexler."""
        try:
            full_index = self._get_index_name(index)
            await self.client.index(
                index=full_index,
                id=doc_id,
                document=document,
            )
            return True
        except Exception as e:
            logger.error(
                "Failed to index document", index=index, doc_id=doc_id, error=str(e)
            )
            return False

    async def bulk_index(
        self,
        index: str,
        documents: List[Dict[str, Any]],
        id_field: str = "id",
    ) -> int:
        """Toplu doküman indexler. Başarıyla indexlenen sayıyı döner."""
        if not documents:
            return 0

        full_index = self._get_index_name(index)

        def generate_actions() -> Any:
            for doc in documents:
                doc_id = doc.get(id_field)
                yield {
                    "_index": full_index,
                    "_id": str(doc_id) if doc_id else None,
                    "_source": doc,
                }

        try:
            success, failed = await async_bulk(
                self.client,
                generate_actions(),
                raise_on_error=False,
            )
            if failed and isinstance(failed, list):
                logger.warning(
                    "Some documents failed to index",
                    index=index,
                    failed_count=len(failed),
                )
            return int(success)
        except Exception as e:
            logger.error("Bulk index failed", index=index, error=str(e))
            return 0

    async def search(
        self,
        index: str,
        query: Dict[str, Any],
        *,
        from_: int = 0,
        size: int = 20,
        sort: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Arama yapar."""
        full_index = self._get_index_name(index)

        try:
            body: Dict[str, Any] = {"query": query}
            if sort:
                body["sort"] = sort

            response = await self.client.search(
                index=full_index,
                body=body,
                from_=from_,
                size=size,
            )

            hits = response["hits"]["hits"]
            total = response["hits"]["total"]["value"]

            return {
                "hits": [hit["_source"] for hit in hits],
                "total": total,
            }
        except Exception as e:
            logger.error("Search failed", index=index, error=str(e))
            return {"hits": [], "total": 0}

    async def delete_document(self, index: str, doc_id: str) -> bool:
        """Dokümanı siler."""
        try:
            full_index = self._get_index_name(index)
            await self.client.delete(index=full_index, id=doc_id)
            return True
        except Exception as e:
            logger.error("Delete failed", index=index, doc_id=doc_id, error=str(e))
            return False

    async def delete_index(self, index: str) -> bool:
        """Tüm index'i siler."""
        try:
            full_index = self._get_index_name(index)
            await self.client.indices.delete(index=full_index)
            return True
        except Exception as e:
            # Index zaten yoksa hata verme
            if "index_not_found_exception" in str(e):
                return True
            logger.error("Delete index failed", index=index, error=str(e))
            return False

    async def create_index(
        self,
        index: str,
        mappings: Optional[Dict[str, Any]] = None,
        settings_dict: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Index oluşturur (mapping ile)."""
        try:
            full_index = self._get_index_name(index)

            # Index zaten varsa skip
            if await self.index_exists(index):
                logger.info("Index already exists", index=full_index)
                return True

            body: Dict[str, Any] = {}
            if mappings:
                body["mappings"] = mappings
            if settings_dict:
                body["settings"] = settings_dict

            await self.client.indices.create(index=full_index, body=body)
            logger.info("Index created", index=full_index)
            return True
        except Exception as e:
            logger.error("Create index failed", index=index, error=str(e))
            return False

    async def index_exists(self, index: str) -> bool:
        """Index'in var olup olmadığını kontrol eder."""
        try:
            full_index = self._get_index_name(index)
            result = await self.client.indices.exists(index=full_index)
            return bool(result)
        except Exception:
            return False

    async def refresh_index(self, index: str) -> bool:
        """Index'i yeniler (aramalar için güncel hale getirir)."""
        try:
            full_index = self._get_index_name(index)
            await self.client.indices.refresh(index=full_index)
            return True
        except Exception as e:
            logger.error("Refresh index failed", index=index, error=str(e))
            return False

    async def health_check(self) -> bool:
        """Elasticsearch bağlantısını kontrol eder."""
        try:
            info = await self.client.info()
            logger.info("Elasticsearch connected", version=info["version"]["number"])
            return True
        except Exception as e:
            logger.error("Elasticsearch health check failed", error=str(e))
            return False

    async def close(self) -> None:
        """Bağlantıyı kapatır."""
        if self._client:
            await self._client.close()
            self._client = None


# Singleton instance (lazy loaded)
search_service: Optional[ElasticsearchService] = None


def get_search_service() -> ElasticsearchService:
    """Returns singleton search service instance."""
    global search_service
    if search_service is None:
        search_service = ElasticsearchService()
    return search_service
