from abc import ABC, abstractmethod
from typing import Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.user import User, UserCreate, UserUpdate


class IUserRepository(IBaseRepository[User, UserCreate, UserUpdate], ABC):
    """
    User Repository Interface.
    Temel CRUD işlemlerine ek olarak kullanıcıya özel metodları tanımlar.
    """

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Email adresine göre kullanıcı döndürür."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Telefon numarasına göre kullanıcı döndürür."""
        raise NotImplementedError
