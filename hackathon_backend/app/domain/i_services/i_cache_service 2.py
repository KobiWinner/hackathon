from abc import ABC, abstractmethod
from typing import Any, List


class ICacheService(ABC):
    """
    Cache Service Interface.
    Redis vb. önbellek mekanizmalarını soyutlar.
    """

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
