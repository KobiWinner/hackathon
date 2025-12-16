from abc import ABC, abstractmethod
from types import TracebackType
from typing import TYPE_CHECKING, Optional, Type

if TYPE_CHECKING:
    from app.domain.i_repositories.i_role_repository import IRoleRepository
    from app.domain.i_repositories.i_user_repository import IUserRepository


class IUnitOfWork(ABC):
    """
    Unit of Work Interface.
    Transaction yönetimini soyutlar.
    """

    @abstractmethod
    async def __aenter__(self) -> "IUnitOfWork":
        """Transaction başlatır."""
        raise NotImplementedError

    @abstractmethod
    async def __aexit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_value: Optional[BaseException],
        traceback: Optional[TracebackType],
    ) -> None:
        """Transaction bitirir (Hata varsa rollback, yoksa close)."""
        raise NotImplementedError

    @abstractmethod
    async def commit(self) -> None:
        raise NotImplementedError

    @abstractmethod
    async def rollback(self) -> None:
        raise NotImplementedError

    @property
    @abstractmethod
    def users(self) -> "IUserRepository":
        raise NotImplementedError

    @property
    @abstractmethod
    def roles(self) -> "IRoleRepository":
        raise NotImplementedError
