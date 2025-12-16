from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.price.price_history import (
    PriceHistory,
    PriceHistoryCreate,
    PriceHistoryUpdate,
)


class IPriceHistoryRepository(
    IBaseRepository[PriceHistory, PriceHistoryCreate, PriceHistoryUpdate], ABC
):
    """
    Price History Repository Interface.
    Fiyat geçmişi kayıtları için özel metodları tanımlar.
    """

    @abstractmethod
    async def get_by_mapping_id(
        self, mapping_id: int, limit: int = 100
    ) -> List[PriceHistory]:
        """Belirli bir product mapping için fiyat geçmişini getirir."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_variant_id(
        self, variant_id: int, limit: int = 100
    ) -> List[PriceHistory]:
        """Belirli bir variant için fiyat geçmişini getirir."""
        raise NotImplementedError

    @abstractmethod
    async def get_latest_by_mapping_id(
        self, mapping_id: int
    ) -> Optional[PriceHistory]:
        """Belirli bir product mapping için en son fiyat kaydını getirir."""
        raise NotImplementedError

    @abstractmethod
    async def create_bulk(
        self, *, items: List[PriceHistoryCreate], commit: bool = True
    ) -> List[PriceHistory]:
        """Toplu fiyat geçmişi kaydı oluşturur (batch insert)."""
        raise NotImplementedError
