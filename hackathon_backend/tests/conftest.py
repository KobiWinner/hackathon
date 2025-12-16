from types import TracebackType
from typing import Any, AsyncGenerator, Optional, Type

import pytest
from httpx import ASGITransport, AsyncClient
from redis.asyncio import Redis
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy import pool, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config.settings import settings
from app.core.infrastructure.cache import cache
from app.main import app
from app.persistence.db.base import Base

# Modellerin Base.metadata'ya eklenmesi için import edilmesi gerekir
# import app.models  # Dinamik import bazen yetersiz kalabiliyor
from app.persistence.models.user import User  # noqa: F401

# 1. Veritabanı URL'i
TEST_DATABASE_URI = (
    f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
    f"@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/hackathon_test"
)


# Engine
@pytest.fixture(scope="function")
async def engine() -> AsyncGenerator[AsyncEngine, None]:
    # User model already imported at module level for metadata registration

    e = create_async_engine(
        TEST_DATABASE_URI, echo=False, future=True, poolclass=pool.NullPool
    )

    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield e

    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await e.dispose()


# Session Factory
@pytest.fixture(scope="function")
async def session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )


# Her Test İçin Session
@pytest.fixture(scope="function")
async def db_session(
    session_factory: async_sessionmaker[AsyncSession], engine: AsyncEngine
) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session
        await session.rollback()
        await session.close()

    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(
                text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;')
            )


# API Client
@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    from app.api.deps import get_uow
    from app.infrastructure.unit_of_work import UnitOfWork
    from app.persistence.db.session import get_db

    app.dependency_overrides[get_db] = override_get_db

    async def override_get_uow() -> AsyncGenerator[UnitOfWork, None]:
        class TestUnitOfWork(UnitOfWork):
            def __init__(self) -> None:
                self.session = db_session

            async def __aenter__(self) -> "TestUnitOfWork":
                return self

            async def __aexit__(
                self,
                exc_type: Optional[Type[BaseException]],
                exc_val: Optional[BaseException],
                exc_tb: Optional[TracebackType],
            ) -> None:
                pass

            async def commit(self) -> None:
                if self.session:
                    await self.session.flush()

            async def rollback(self) -> None:
                if self.session:
                    await self.session.rollback()

        yield TestUnitOfWork()

    app.dependency_overrides[get_uow] = override_get_uow

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(scope="function", autouse=True)
async def patch_redis_connection() -> AsyncGenerator[None, None]:
    """
    Her test için taze bir Redis bağlantısı oluşturur ve
    global 'cache' servisine enjekte eder.
    Bağlantı hatası durumunda MockRedis kullanır.
    """
    # 2. Global nesneyi yedeğe al
    old_redis = cache.redis

    try:
        # 1. Yeni Redis bağlantısı (Mevcut test loop'una bağlı)
        new_redis = Redis.from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )

        # Bağlantı testi (Hızlı fail için)
        await new_redis.ping()
        await new_redis.flushdb()

        # 3. Yeni bağlantıyı enjekte et
        cache.redis = new_redis

        yield

        # 4. Test bitince bağlantıyı kapat
        await new_redis.close()

    except (ConnectionError, OSError, RedisConnectionError) as e:
        print(f"Redis connection failed, using Mock: {e}")

        # Mock Redis implementation
        class MockRedis:
            def __init__(self) -> None:
                self.data: dict[str, Any] = {}

            async def get(self, key: str) -> Optional[str]:
                return self.data.get(key)

            async def set(
                self, key: str, value: str, *args: Any, **kwargs: Any
            ) -> bool:
                self.data[key] = value
                return True

            async def delete(self, key: str) -> int:
                if key in self.data:
                    del self.data[key]
                return 1

            async def flushdb(self) -> bool:
                self.data = {}
                return True

            async def close(self) -> None:
                pass

            async def ping(self) -> bool:
                return True

        cache.redis = MockRedis()  # type: ignore[assignment]
        yield

    finally:
        # 5. Global nesneyi eski haline getir
        cache.redis = old_redis  # type: ignore[assignment]
