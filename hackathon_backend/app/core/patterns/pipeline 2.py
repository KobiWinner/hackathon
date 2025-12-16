from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.domain.schemas.auth import UserContext


class PipelineContext:
    def __init__(self, initial_data: Any = None, user: Optional[UserContext] = None):
        self.data = initial_data
        self.user = user
        self.result: Any = None
        self.errors: List[str] = []
        self.meta: Dict[str, Any] = {}

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0


# Her adımın uyması gereken şablon
class BaseStep(ABC):
    @abstractmethod
    async def process(self, context: PipelineContext) -> None:
        """Her adım context üzerinde işlem yapar."""
        pass


# Adımları sırayla çalıştıran yönetici
class PipelineRunner:
    def __init__(self, steps: List[BaseStep]):
        self.steps = steps

    async def run(self, context: PipelineContext) -> PipelineContext:
        for step in self.steps:
            if not context.is_valid:
                break  # Hata varsa dur
            await step.process(context)
        return context
