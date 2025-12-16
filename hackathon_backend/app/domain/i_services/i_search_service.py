"""Search Service Interface."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ISearchService(ABC):
    """
    Search Service Interface.
    Elasticsearch veya benzeri arama motorlarını soyutlar.
    """

    @abstractmethod
    async def index_document(
        self,
        index: str,
        doc_id: str,
        document: Dict[str, Any],
    ) -> bool:
        """Tek bir dokümanı indexler."""
        raise NotImplementedError

    @abstractmethod
    async def bulk_index(
        self,
        index: str,
        documents: List[Dict[str, Any]],
        id_field: str = "id",
    ) -> int:
        """Toplu doküman indexler. Başarıyla indexlenen sayıyı döner."""
        raise NotImplementedError

    @abstractmethod
    async def search(
        self,
        index: str,
        query: Dict[str, Any],
        *,
        from_: int = 0,
        size: int = 20,
        sort: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Arama yapar.

        Returns:
            Dict with keys: 'hits' (list), 'total' (int)
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_document(self, index: str, doc_id: str) -> bool:
        """Dokümanı siler."""
        raise NotImplementedError

    @abstractmethod
    async def delete_index(self, index: str) -> bool:
        """Tüm index'i siler."""
        raise NotImplementedError

    @abstractmethod
    async def create_index(
        self,
        index: str,
        mappings: Optional[Dict[str, Any]] = None,
        settings: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Index oluşturur (mapping ile)."""
        raise NotImplementedError

    @abstractmethod
    async def index_exists(self, index: str) -> bool:
        """Index'in var olup olmadığını kontrol eder."""
        raise NotImplementedError

    @abstractmethod
    async def refresh_index(self, index: str) -> bool:
        """Index'i yeniler (aramalar için güncel hale getirir)."""
        raise NotImplementedError

    @abstractmethod
    async def health_check(self) -> bool:
        """Elasticsearch bağlantısını kontrol eder."""
        raise NotImplementedError
