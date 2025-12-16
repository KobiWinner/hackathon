from unittest.mock import AsyncMock, MagicMock

import pytest
from pytest_mock import MockerFixture

from app.application.cqrs.commands.user_command import UserCommandService
from app.domain.schemas.user import User
from tests.factories import UserCreateFactory


@pytest.mark.asyncio
async def test_user_command_create_via_pipeline(mocker: MockerFixture) -> None:
    # 1. Mock dependencies
    mock_uow = mocker.MagicMock()
    mock_uow.__aenter__.return_value = mock_uow
    mock_uow.__aexit__ = AsyncMock()
    mock_uow.commit = AsyncMock()

    # Mock CacheService
    mock_cache_service = mocker.MagicMock()
    mock_cache_service.lpush = AsyncMock()
    mock_cache_service.ltrim = AsyncMock()

    # Mock Repository checks (via UoW)
    mock_uow.users.get_by_email = AsyncMock(return_value=None)
    mock_uow.users.get_by_phone = AsyncMock(return_value=None)

    # Mock created user (Pydantic schema döner)
    mock_created_user = User(
        id=1,
        first_name="Test",
        last_name="User",
        email="test@example.com",
        phone_number="1234567890",
        is_active=True,
        is_superuser=False,
        is_email_verified=False,
        is_phone_verified=False,
    )
    mock_uow.users.create = AsyncMock(return_value=mock_created_user)

    # Mock Roles
    mock_role = MagicMock()
    mock_role.id = 1
    mock_uow.roles.get_by_name = AsyncMock(return_value=mock_role)

    # 2. Prepare Data
    user_in = UserCreateFactory.build(password="ComplexPass123")

    # 3. Call Service
    service = UserCommandService(mock_uow, mock_cache_service)
    result = await service.create(user_in)

    # 4. Assertions
    mock_uow.users.create.assert_called_once()
    mock_uow.commit.assert_called_once()

    # Verify result is the created user
    assert result.email == mock_created_user.email

    # Verify Redis Push
    assert mock_cache_service.lpush.called
