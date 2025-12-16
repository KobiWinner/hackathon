import json
from unittest.mock import AsyncMock, MagicMock

import pytest
from pytest_mock import MockerFixture

from app.application.cqrs.commands.user_command import UserCommandService
from app.application.cqrs.queries.user_query import UserQueryService
from app.domain.schemas.user import User
from tests.factories import UserCreateFactory


@pytest.mark.asyncio
async def test_get_recent_users(mocker: MockerFixture) -> None:
    # 1. Mock CacheService
    mock_cache_service = mocker.MagicMock()

    # 2. Setup Mock Data
    fake_users_data = [
        json.dumps(
            {
                "id": 1,
                "first_name": "User",
                "last_name": "One",
                "email": "u1@example.com",
                "phone_number": "123",
            }
        ),
        json.dumps(
            {
                "id": 2,
                "first_name": "User",
                "last_name": "Two",
                "email": "u2@example.com",
                "phone_number": "456",
            }
        ),
    ]
    mock_cache_service.lrange = AsyncMock(return_value=fake_users_data)

    # 3. Call Service
    service = UserQueryService(mock_cache_service)
    results = await service.get_recent_users(limit=10)

    # 4. Assertions
    assert len(results) == 2
    assert results[0].full_name == "User One"
    assert results[1].email == "u2@example.com"
    mock_cache_service.lrange.assert_called_once_with("users:recent", 0, 9)


@pytest.mark.asyncio
async def test_create_user_pushes_to_redis_via_pipeline(mocker: MockerFixture) -> None:
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
    user_in = UserCreateFactory.build(password="SecurePass123")

    # 3. Call Service
    service = UserCommandService(mock_uow, mock_cache_service)
    await service.create(user_in)

    # 4. Assertions
    # Check if LPUSH was called
    assert mock_cache_service.lpush.called
    call_args = mock_cache_service.lpush.call_args
    assert call_args[0][0] == "users:recent"  # Key check

    pushed_data = json.loads(call_args[0][1])
    assert pushed_data["first_name"] == mock_created_user.first_name
    assert pushed_data["last_name"] == mock_created_user.last_name

    # Check LTRIM
    mock_cache_service.ltrim.assert_called_once_with("users:recent", 0, 9)
