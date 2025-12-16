from typing import Annotated, AsyncGenerator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.application.cqrs.commands.user_command import UserCommandService
from app.application.services.auth_service import AuthService
from app.core.infrastructure.cache import cache
from app.core.security.auth import decode_access_token
from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.auth import UserContext
from app.infrastructure.unit_of_work import UnitOfWork

# tokenUrl="token" kısmı Auth servisine işaret eder (Bizde şu an mock)
# auto_error=False: Token yoksa hata fırlatma, None dön
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


async def get_current_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme)],
) -> UserContext:
    """
    Dependency: Header'daki Token'ı alır, çözer ve UserContext döner.
    Token geçersizse veya yoksa 401 hatası fırlatır.

    Kullanım: Korumalı endpoint'ler için
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)

    if payload is None or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserContext(user_id=payload.sub, roles=payload.roles)


async def get_optional_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme)],
) -> Optional[UserContext]:
    """
    Dependency: Opsiyonel authentication.
    Token varsa ve geçerliyse UserContext döner.
    Token yoksa veya geçersizse None döner (hata fırlatmaz).

    Kullanım: Public endpoint'ler için (ör: kategoriler, ürün listeleme)
    Kullanıcı giriş yapmışsa ekstra bilgi gösterilebilir.
    """
    if token is None:
        return None

    payload = decode_access_token(token)

    if payload is None or payload.sub is None:
        return None

    return UserContext(user_id=payload.sub, roles=payload.roles)


async def get_uow() -> AsyncGenerator[UnitOfWork, None]:
    """
    Endpoint'lere UnitOfWork nesnesi enjekte eder.
    """
    uow = UnitOfWork()
    yield uow


async def get_auth_service(uow: UnitOfWork = Depends(get_uow)) -> AuthService:
    return AuthService(uow)


async def get_cache_service() -> ICacheService:
    return cache


async def get_user_command_service(
    uow: UnitOfWork = Depends(get_uow),
    cache_service: ICacheService = Depends(get_cache_service),
) -> UserCommandService:
    return UserCommandService(uow, cache_service)
