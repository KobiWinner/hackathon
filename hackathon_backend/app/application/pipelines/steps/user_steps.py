import json
from typing import Optional

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.role import RoleCreate
from app.domain.schemas.user import UserCreate


class ValidateUserUniqueStep(BaseStep):
    """
    Kullanıcının veritabanında daha önce kayıtlı olup olmadığını kontrol eder.
    Email veya Telefon numarası kontrol edilir.
    """

    def __init__(self, uow: Optional[IUnitOfWork] = None) -> None:
        self.uow = uow

    async def process(self, context: PipelineContext) -> None:
        user_in = context.data

        if self.uow is None:
            context.errors.append("UnitOfWork not initialized")
            return

        # uow.users property'si üzerinden erişim
        if await self.uow.users.get_by_email(user_in.email):
            context.errors.append("Bu e-posta adresi zaten kayıtlı.")
            return

        if user_in.phone_number and await self.uow.users.get_by_phone(
            user_in.phone_number
        ):
            context.errors.append("Bu telefon numarası zaten kayıtlı.")
            return


class CreateUserStep(BaseStep):
    """
    Kullanıcının kaydedilmesi ve Redis'e eklenmesi.
    ORM bilgisi içermez, repository.create() kullanır.
    """

    def __init__(self, uow: IUnitOfWork, cache_service: ICacheService) -> None:
        self.uow = uow
        self.cache_service = cache_service

    async def process(self, context: PipelineContext) -> None:
        user_in: UserCreate = context.data

        # 1. Get or Create Default Role
        default_role = await self.uow.roles.get_by_name("user")
        role_ids = []

        if not default_role:
            role_in = RoleCreate(name="user", description="Default user role")
            default_role = await self.uow.roles.create(obj_in=role_in, commit=False)

        if default_role:
            role_ids = [default_role.id]

        # 2. UserCreate'e role_ids ekle (yeni bir instance oluştur)
        user_with_roles = UserCreate(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            password=user_in.password,
            phone_number=user_in.phone_number,
            is_active=user_in.is_active,
            is_superuser=user_in.is_superuser,
            is_email_verified=user_in.is_email_verified,
            is_phone_verified=user_in.is_phone_verified,
            role_ids=role_ids,
        )

        # 3. Repository üzerinden kullanıcı oluştur
        created_user = await self.uow.users.create(obj_in=user_with_roles, commit=False)

        # 4. Transaction'ı commit et
        await self.uow.commit()

        # 5. Sonucu context'e kaydet
        context.result = created_user

        # 6. Redis Cache update
        try:
            user_cache_data = {
                "id": created_user.id,
                "first_name": created_user.first_name,
                "last_name": created_user.last_name,
                "email": created_user.email,
                "phone_number": created_user.phone_number,
            }
            await self.cache_service.lpush("users:recent", json.dumps(user_cache_data))
            await self.cache_service.ltrim("users:recent", 0, 9)
        except Exception as e:
            print(f"Redis cache error: {e}")
