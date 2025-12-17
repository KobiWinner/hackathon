from typing import Optional, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.price.currency import Currency


class CurrencyRepository(BaseRepository):
    """Currency veritabanı işlemleri."""
    
    orm_model = Currency

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_code(self, code: str) -> Optional[Currency]:
        """Para birimi koduna göre getirir."""
        query = select(self.orm_model).where(self.orm_model.code == code.upper())
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_all(self) -> List[Currency]:
        """Tüm para birimlerini döndürür."""
        query = select(self.orm_model)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_all_as_dict(self) -> Dict[str, int]:
        """Tüm para birimlerini {code: id} sözlüğü olarak döndürür."""
        currencies = await self.get_all()
        return {c.code: c.id for c in currencies}
