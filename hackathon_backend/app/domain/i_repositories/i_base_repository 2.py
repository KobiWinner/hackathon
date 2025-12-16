from abc import ABC, abstractmethod
from typing import Any, Generic, Optional, Sequence, TypeVar

from pydantic import BaseModel

from app.domain.schemas.query import QueryParams

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class IBaseRepository(ABC, Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Abstract Repository Interface.
    """

    @abstractmethod
    async def get(self, id: Any) -> Optional[ModelType]:
        raise NotImplementedError

    @abstractmethod
    async def get_multi(self, query_params: QueryParams) -> Sequence[ModelType]:
        """Gelişmiş filtreleme ve sıralama ile liste getirir."""
        raise NotImplementedError

    @abstractmethod
    async def create(
        self, *, obj_in: CreateSchemaType, commit: bool = True
    ) -> ModelType:
        """Yeni bir kayıt oluşturur."""
        raise NotImplementedError

    @abstractmethod
    async def update(
        self,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType,
        commit: bool = True,
    ) -> ModelType:
        """Mevcut bir kaydı günceller."""
        raise NotImplementedError

    @abstractmethod
    async def delete(self, *, id: int, commit: bool = True) -> Optional[ModelType]:
        """ID'ye göre bir kaydı siler."""
        raise NotImplementedError
