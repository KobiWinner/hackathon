from types import TracebackType
from typing import Optional, Type

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.infrastructure.repositories.price_history_repository import (
    PriceHistoryRepository,
)
from app.infrastructure.repositories.role_repository import RoleRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.persistence.db.session import AsyncSessionLocal


class UnitOfWork(IUnitOfWork):
    """
    SQLAlchemy için Unit of Work Implementasyonu.
    """

    def __init__(
        self, session_factory: async_sessionmaker[AsyncSession] = AsyncSessionLocal
    ):
        self.session_factory = session_factory
        self.session: Optional[AsyncSession] = None

    async def __aenter__(self) -> "UnitOfWork":
        self.session = self.session_factory()
        return self

    async def __aexit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_value: Optional[BaseException],
        traceback: Optional[TracebackType],
    ) -> None:
        if self.session:
            if exc_type:
                await self.rollback()
            await self.session.close()

    async def commit(self) -> None:
        if self.session:
            await self.session.commit()

    async def rollback(self) -> None:
        if self.session:
            await self.session.rollback()

    @property
    def users(self) -> UserRepository:
        return UserRepository(self.db)

    @property
    def roles(self) -> RoleRepository:
        return RoleRepository(self.db)

    @property
    def price_histories(self) -> PriceHistoryRepository:
        return PriceHistoryRepository(self.db)

    @property
    def db(self) -> AsyncSession:
        if not self.session:
            raise RuntimeError("Unit of Work is not started. Use 'async with uow:'")
        return self.session
