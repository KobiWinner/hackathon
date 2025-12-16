from app.application.pipelines.base import BasePipeline
from app.application.pipelines.steps.user_steps import (
    CreateUserStep,
    ValidateUserUniqueStep,
)
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_cache_service import ICacheService


class UserRegistrationPipeline(BasePipeline):
    def __init__(self, uow: IUnitOfWork, cache_service: ICacheService):
        super().__init__(uow)

        # 1. Benzersizlik Kontrolü (Fail fast)
        self.add_step(ValidateUserUniqueStep(uow))

        # 2. Kayıt ve Cache
        self.add_step(CreateUserStep(uow, cache_service))
