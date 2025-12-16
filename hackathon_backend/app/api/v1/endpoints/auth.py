from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_auth_service, get_user_command_service
from app.application.cqrs.commands.user_command import UserCommandService
from app.application.services.auth_service import AuthService
from app.core.exceptions import AuthenticationError, ValidationException
from app.domain.schemas.auth import LoginRequest, Token
from app.domain.schemas.user import User, UserCreate

router = APIRouter()


@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    service: UserCommandService = Depends(get_user_command_service),
) -> Any:
    """Yeni kullanıcı kaydeder."""
    try:
        return await service.create(user_in)
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=e.message) from e


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> Any:
    """Giriş yapar ve Token döner."""
    try:
        return await service.login(login_data)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=401,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
