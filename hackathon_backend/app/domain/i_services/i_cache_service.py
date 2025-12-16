from abc import ABC, abstractmethod
from typing import Any, List, Optional


class ICacheService(ABC):
    """
    Cache Service Interface.
    Redis vb. önbellek mekanizmalarını soyutlar.
    """

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Cache'ten veri çeker."""
        raise NotImplementedError

    @abstractmethod
    async def set(self, key: str, value: Any, expire: int = 60) -> None:
        """Cache'e veri yazar. expire: Saniye cinsinden TTL."""
        raise NotImplementedError

    @abstractmethod
    async def lpush(self, key: str, value: str) -> None:
        """Listeye eleman ekler (Sol taraftan)."""
        raise NotImplementedError

    @abstractmethod
    async def lrange(self, key: str, start: int, end: int) -> List[Any]:
        """Listeden aralık çeker."""
        raise NotImplementedError

    @abstractmethod
    async def ltrim(self, key: str, start: int, end: int) -> None:
        """Listeyi kırpar."""
        raise NotImplementedError
