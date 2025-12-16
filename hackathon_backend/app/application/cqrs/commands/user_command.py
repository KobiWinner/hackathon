from typing import cast

from app.application.pipelines.user_pipeline import UserRegistrationPipeline
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_cache_service import ICacheService
from app.domain.schemas.user import User, UserCreate


class UserCommandService:
    def __init__(self, uow: IUnitOfWork, cache_service: ICacheService) -> None:
        self.uow = uow
        self.cache_service = cache_service

    async def create(self, user_in: UserCreate) -> User:
        """
        Kullanıcı kayıt işlemini Pipeline üzerinden yönetir.
        """
        async with self.uow:
            pipeline = UserRegistrationPipeline(self.uow, self.cache_service)
            result = await pipeline.execute(data=user_in)
            return cast(User, result)
