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
        self.steps.append(step)
        return self

    async def execute(self, data: Any, user: Optional[UserContext] = None) -> PipelineContext:
        """
        Pipeline'ı çalıştırır ve sonuçları içeren context nesnesini döndürür.

        Args:
            data: İşlenecek ana veri.
            user: İşlemi yapan kullanıcı.

        Returns:
            PipelineContext: İşlemin sonucunu ve durumunu içeren context nesnesi.
        """
        context = PipelineContext(initial_data=data, user=user)
        runner = PipelineRunner(self.steps)
        await runner.run(context)
        return context
