from typing import Optional, Type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.i_repositories.i_role_repository import IRoleRepository
from app.domain.schemas.role import Role as RoleSchema
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.role import Role as RoleModel


class RoleRepository(BaseRepository, IRoleRepository):
    """
    Role Repository Implementation.
    BaseRepositoryImpl'den miras alır, IRoleRepository interface'ini implement eder.
    """

    orm_model: Type[RoleModel] = RoleModel
    schema_class: Type[RoleSchema] = RoleSchema

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_name(self, name: str) -> Optional[RoleSchema]:
        result = await self.db.execute(select(RoleModel).where(RoleModel.name == name))
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore
