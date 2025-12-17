import json
from typing import Any, List, Optional

from redis.asyncio import from_url

from app.core.config.settings import settings
from app.domain.i_services.i_cache_service import ICacheService


class CacheService(ICacheService):
    def __init__(self) -> None:
        # Redis in Python 3.13+ is not a generic class, use Any typing
        self.redis: Any = from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )

    async def get(self, key: str) -> Optional[Any]:
        """Cache'ten veri çeker."""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, expire: int = 60) -> None:
        """
        Cache'e veri yazar.
        expire: Saniye cinsinden yaşam süresi (TTL). Default 60sn.
        """
        await self.redis.set(key, json.dumps(value), ex=expire)

    async def delete(self, key: str) -> None:
        """Belirli bir key'i siler."""
        await self.redis.delete(key)

    async def close(self) -> None:
        """Bağlantıyı kapatır."""
        await self.redis.close()

    async def lpush(self, key: str, value: str) -> None:
        await self.redis.lpush(key, value)

    async def lrange(self, key: str, start: int, end: int) -> List[Any]:
        result: List[Any] = await self.redis.lrange(key, start, end)
        return result

    async def ltrim(self, key: str, start: int, end: int) -> None:
        await self.redis.ltrim(key, start, end)


# Singleton instance
cache = CacheService()


def get_cache() -> CacheService:
    """Cache singleton instance döndürür."""
    return cache
