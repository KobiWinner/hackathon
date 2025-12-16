from typing import List, Optional, Type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.auth import get_password_hash
from app.domain.i_repositories.i_user_repository import IUserRepository
from app.domain.schemas.user import User as UserSchema
from app.domain.schemas.user import UserCreate
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.role import Role as RoleModel
from app.persistence.models.user import User as UserModel


class UserRepository(BaseRepository, IUserRepository):
    """
    User Repository Implementation.
    BaseRepository'den miras alır, IUserRepository interface'ini implement eder.
    """

    orm_model: Type[UserModel] = UserModel
    schema_class: Type[UserSchema] = UserSchema

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def _get_roles_by_ids(self, role_ids: List[int]) -> List[RoleModel]:
        """Role ID'lerine göre Role ORM nesnelerini getirir."""
        if not role_ids:
            return []
        result = await self.db.execute(
            select(RoleModel).where(RoleModel.id.in_(role_ids))
        )
        return list(result.scalars().all())

    async def create(  # type: ignore[override]
        self, *, obj_in: UserCreate, commit: bool = True
    ) -> UserSchema:
        """Kullanıcı oluşturur. Password→hashed_password dönüşümü ve role ataması."""
        hashed_password = get_password_hash(obj_in.password)

        roles: List[RoleModel] = []
        if obj_in.role_ids:
            roles = await self._get_roles_by_ids(obj_in.role_ids)

        db_user = UserModel(
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            email=obj_in.email,
            phone_number=obj_in.phone_number,
            hashed_password=hashed_password,
            is_active=obj_in.is_active,
            is_superuser=obj_in.is_superuser,
            is_email_verified=obj_in.is_email_verified,
            is_phone_verified=obj_in.is_phone_verified,
        )

        db_user.roles = roles

        self.db.add(db_user)
        if commit:
            await self.db.commit()
            await self.db.refresh(db_user)
        else:
            await self.db.flush()

        return self._to_schema(db_user)  # type: ignore

    async def get_by_email(self, email: str) -> Optional[UserSchema]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore

    async def get_by_phone(self, phone: str) -> Optional[UserSchema]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.phone_number == phone)
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore
