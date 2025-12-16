from typing import Any, List, Optional

from app.core.exceptions import ValidationException
from app.core.patterns.pipeline import BaseStep, PipelineContext, PipelineRunner
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.schemas.auth import UserContext


class BasePipeline:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow
        self.steps: List[BaseStep] = []

    def add_step(self, step: BaseStep) -> "BasePipeline":
        """
        Zincire yeni bir adım ekler.
        Fluent interface (return self) sayesinde zincirleme ekleme yapılabilir.
        """
        self.steps.append(step)
        return self

    async def execute(self, data: Any, user: Optional[UserContext] = None) -> Any:
        """
        Pipeline'ı çalıştırır.

        Args:
            data: İşlenecek ana veri (örn: ItemCreate şeması)
            user: İşlemi yapan kullanıcı (Auth context)

        Returns:
            PipelineContext.result: İşlemin sonucu

        Raises:
            HTTPException: Pipeline adımlarında hata oluşursa (400 Bad Request)
        """
        # 1. Context oluşturuluyor (Veri + Kullanıcı birleşiyor)
        context = PipelineContext(initial_data=data, user=user)

        # 2. Runner hazırlanıyor ve çalıştırılıyor
        runner = PipelineRunner(self.steps)
        await runner.run(context)

        # 3. Hata kontrolü
        if not context.is_valid:
            # İlk hatayı kullanıcıya dön (400 Bad Request)
            # İstersen tüm hataları string olarak birleştirip de dönebilirsin
            error_message = context.errors[0]
            raise ValidationException(message=error_message)

        # 4. Sonuç dönüşü
        return context.result
