from typing import List, Optional, Type

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.i_repositories.i_price_history_repository import IPriceHistoryRepository
from app.domain.schemas.price.price_history import (
    PriceHistory as PriceHistorySchema,
    PriceHistoryCreate,
)
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.price.price_history import PriceHistory as PriceHistoryModel


class PriceHistoryRepository(BaseRepository, IPriceHistoryRepository):
    """
    Price History Repository Implementation.
    Fiyat geçmişi kayıtları için CRUD ve özel sorgu metodları.
    """

    orm_model: Type[PriceHistoryModel] = PriceHistoryModel
    schema_class: Type[PriceHistorySchema] = PriceHistorySchema

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_by_mapping_id(
        self, mapping_id: int, limit: int = 100
    ) -> List[PriceHistorySchema]:
        """Belirli bir product mapping için fiyat geçmişini getirir (en yeniden eskiye)."""
        result = await self.db.execute(
            select(PriceHistoryModel)
            .where(PriceHistoryModel.mapping_id == mapping_id)
            .order_by(desc(PriceHistoryModel.created_at))
            .limit(limit)
        )
        db_objs = result.scalars().all()
        return [self._to_schema(obj) for obj in db_objs]  # type: ignore

    async def get_by_variant_id(
        self, variant_id: int, limit: int = 100
    ) -> List[PriceHistorySchema]:
        """Belirli bir variant için fiyat geçmişini getirir (en yeniden eskiye)."""
        result = await self.db.execute(
            select(PriceHistoryModel)
            .where(PriceHistoryModel.variant_id == variant_id)
            .order_by(desc(PriceHistoryModel.created_at))
            .limit(limit)
        )
        db_objs = result.scalars().all()
        return [self._to_schema(obj) for obj in db_objs]  # type: ignore

    async def get_latest_by_mapping_id(
        self, mapping_id: int
    ) -> Optional[PriceHistorySchema]:
        """Belirli bir product mapping için en son fiyat kaydını getirir."""
        result = await self.db.execute(
            select(PriceHistoryModel)
            .where(PriceHistoryModel.mapping_id == mapping_id)
            .order_by(desc(PriceHistoryModel.created_at))
            .limit(1)
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore

    async def create_bulk(
        self, *, items: List[PriceHistoryCreate], commit: bool = True
    ) -> List[PriceHistorySchema]:
        """
        Toplu fiyat geçmişi kaydı oluşturur (batch insert).
        Performans için tek seferde tüm kayıtları ekler.
        """
        db_objs = []
        for item in items:
            db_obj = PriceHistoryModel(
                mapping_id=item.mapping_id,
                variant_id=item.variant_id,
                price=item.price,
                original_price=item.original_price,
                discount_rate=item.discount_rate,
                currency_id=item.currency_id,
                in_stock=item.in_stock,
                stock_quantity=item.stock_quantity,
            )
            self.db.add(db_obj)
            db_objs.append(db_obj)

        if commit:
            await self.db.commit()
            for obj in db_objs:
                await self.db.refresh(obj)
        else:
            await self.db.flush()

        return [self._to_schema(obj) for obj in db_objs]  # type: ignore
