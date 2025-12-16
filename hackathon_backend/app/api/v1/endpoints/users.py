from typing import Any, List

from fastapi import APIRouter, Depends

from app.api.deps import get_cache_service, oauth2_scheme
from app.application.cqrs.queries.user_query import UserQueryService
from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.user import User

router = APIRouter()


@router.get("/recent", response_model=List[User])
async def get_recent_users(
    cache_service: ICacheService = Depends(get_cache_service),
    token: str = Depends(oauth2_scheme),  # Sadece giriş yapmış kullanıcılar görebilsin
) -> Any:
    """
    Son kayıt olan kullanıcıları getirir (Redis'ten).
    """
    query_service = UserQueryService(cache_service)
    return await query_service.get_recent_users(limit=10)
