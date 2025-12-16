import json
from typing import List

from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.user import User


class UserQueryService:
    def __init__(self, cache: ICacheService):
        self.cache = cache

    async def get_recent_users(self, limit: int = 10) -> List[User]:
        """
        Redis'teki 'users:recent' listesinden son kayıt olan kullanıcıları çeker.
        Bu metod veritabanına gitmez, sadece Redis'i kullanır.
        """
        # LRANGE users:recent 0 (limit-1)
        # Interface list method returns List[Any], likely strings from Redis.
        # Usually needs decoding handled by impl if possible.
        # Our CacheService implementation sets decode_responses=True so we get strings.

        raw_users = await self.cache.lrange("users:recent", 0, limit - 1)

        users: List[User] = []
        for raw_user in raw_users:
            if isinstance(raw_user, bytes):
                raw_user = raw_user.decode("utf-8")

            try:
                user_dict = json.loads(raw_user)
                users.append(User(**user_dict))
            except (json.JSONDecodeError, ValueError):
                continue

        return users
