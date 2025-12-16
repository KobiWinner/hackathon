import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.auth import get_password_hash
from app.persistence.models.user import User
from tests.factories import UserCreateFactory, UserModelFactory

# app/main.py should confirm the prefix. Assuming /api/v1/auth based on file structure.


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession) -> None:
    # 1. Prepare Data
    user_in = UserCreateFactory.build()  # Build dict/obj without saving
    payload = {
        "first_name": user_in.first_name,
        "last_name": user_in.last_name,
        "email": user_in.email,
        "password": user_in.password,
        "phone_number": user_in.phone_number,
    }

    # 2. Call API
    response = await client.post("/api/v1/auth/register", json=payload)

    # 3. Verify Response
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["first_name"] == user_in.first_name
    assert data["last_name"] == user_in.last_name
    assert data["full_name"] == f"{user_in.first_name} {user_in.last_name}"
    assert "id" in data

    # 4. Verify DB
    result = await db_session.execute(select(User).where(User.email == user_in.email))
    db_user = result.scalars().first()
    assert db_user is not None
    assert db_user.email == user_in.email


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, db_session: AsyncSession) -> None:
    # 1. Create User in DB
    password = "securepassword"
    hashed_password = get_password_hash(password)
    user = UserModelFactory.create(hashed_password=hashed_password)
    # Note: Factory boy handling of async sqlalchemy might be tricky.
    # If UserModelFactory doesn't auto-save, we do it manually.
    # Since factories.py defines "model = Item", it might try to save
    # if SQLAlchemyModelFactory is used, but here it is just factory.Factory.
    # Let's save manually to be safe or use simple object creation
    # if factory is not set up for DB persistence.

    # factories.py: "Generates model object without saving to DB"
    db_session.add(user)
    await db_session.commit()

    # 2. Call Login API
    payload = {"email": user.email, "password": password}
    response = await client.post("/api/v1/auth/login", json=payload)

    # 3. Verify Response
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    # 1. Create User
    password = "securepassword"
    hashed_password = get_password_hash(password)
    user = UserModelFactory.create(hashed_password=hashed_password)
    db_session.add(user)
    await db_session.commit()

    # 2. Call Login API with wrong password
    payload = {"email": user.email, "password": "wrongpassword"}
    response = await client.post("/api/v1/auth/login", json=payload)

    # 3. Verify Error
    assert response.status_code == 401
