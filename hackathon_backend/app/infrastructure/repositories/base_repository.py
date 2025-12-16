from typing import Any, Optional, Sequence, Type

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import and_, asc, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.query import QueryParams
from app.persistence.db.base import Base

# Type variables for ORM model and Pydantic schemas
ORMModelType = Type[Base]
SchemaType = Type[BaseModel]


class BaseRepository(IBaseRepository[BaseModel, BaseModel, BaseModel]):
    """
    Base Repository Implementation.
    ORM modellerini Domain Schema'lara dönüştürür.
    Tüm concrete repository'ler bu sınıftan miras alır.
    """

    # Subclass'lar tarafından override edilmeli
    orm_model: Type[Base]
    schema_class: Type[BaseModel]

    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_schema(self, db_obj: Base) -> BaseModel:
        """SQLAlchemy modelini Pydantic schema'ya dönüştürür."""
        return self.schema_class.model_validate(db_obj)

    async def get(self, id: Any) -> Optional[BaseModel]:
        db_obj = await self.db.get(self.orm_model, id)
        return self._to_schema(db_obj) if db_obj else None

    async def get_multi(self, query_params: QueryParams) -> Sequence[BaseModel]:
        query = select(self.orm_model)

        # Filtering
        conditions = []
        for f in query_params.filters:
            if not hasattr(self.orm_model, f.field):
                continue
            column = getattr(self.orm_model, f.field)
            val = f.value
            op = f.operator

            if op == "eq":
                conditions.append(column == val)
            elif op == "neq":
                conditions.append(column != val)
            elif op == "gt":
                conditions.append(column > val)
            elif op == "lt":
                conditions.append(column < val)
            elif op == "gte":
                conditions.append(column >= val)
            elif op == "lte":
                conditions.append(column <= val)
            elif op == "contains":
                conditions.append(column.ilike(f"%{val}%"))
            elif op == "startswith":
                conditions.append(column.ilike(f"{val}%"))
            elif op == "in":
                conditions.append(column.in_(val))

        if conditions:
            query = query.where(and_(*conditions))

        # Sorting
        for s in query_params.sort:
            if not hasattr(self.orm_model, s.field):
                continue
            column = getattr(self.orm_model, s.field)
            if s.direction == "desc":
                query = query.order_by(desc(column))
            else:
                query = query.order_by(asc(column))

        if not query_params.sort and hasattr(self.orm_model, "id"):
            query = query.order_by(self.orm_model.id)  # type: ignore

        query = query.offset(query_params.skip).limit(query_params.size)

        result = await self.db.execute(query)
        db_objs = result.scalars().all()
        return [self._to_schema(obj) for obj in db_objs]

    async def create(self, *, obj_in: BaseModel, commit: bool = True) -> BaseModel:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.orm_model(**obj_in_data)
        self.db.add(db_obj)

        if commit:
            await self.db.commit()
            await self.db.refresh(db_obj)
        else:
            await self.db.flush()

        return self._to_schema(db_obj)

    async def update(
        self, *, db_obj: BaseModel, obj_in: BaseModel, commit: bool = True
    ) -> BaseModel:
        # Schema'dan ID al ve ORM nesnesini getir
        orm_obj = await self.db.get(self.orm_model, db_obj.id)  # type: ignore
        if not orm_obj:
            raise ValueError(f"Object with id {db_obj.id} not found")  # type: ignore

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(orm_obj, field, value)

        self.db.add(orm_obj)
        if commit:
            await self.db.commit()
            await self.db.refresh(orm_obj)
        else:
            await self.db.flush()

        return self._to_schema(orm_obj)

    async def delete(self, *, id: int, commit: bool = True) -> Optional[BaseModel]:
        db_obj = await self.db.get(self.orm_model, id)
        if db_obj:
            await self.db.delete(db_obj)
            if commit:
                await self.db.commit()
            else:
                await self.db.flush()
            return self._to_schema(db_obj)
        return None
