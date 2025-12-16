from abc import ABC, abstractmethod
from typing import Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.role import Role, RoleCreate, RoleUpdate


class IRoleRepository(IBaseRepository[Role, RoleCreate, RoleUpdate], ABC):
    """
    Role Repository Interface.
    Temel CRUD işlemlerini içerir.
    """

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Role]:
        raise NotImplementedError
