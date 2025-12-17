from typing import Optional, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.providers.provider import Provider


class ProviderRepository(BaseRepository):
    """Provider veritabanı işlemleri."""
    
    orm_model = Provider
    # schema_class tanımlamıyoruz çünkü henüz yok, BaseRepository metodları (get, create) hata verebilir.
    # Ancak manuel metodlar çalışacaktır.

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_name(self, name: str) -> Optional[Provider]:
        """İsme göre provider getirir."""
        query = select(self.orm_model).where(self.orm_model.name == name)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_all_as_dict(self) -> Dict[str, int]:
        """Tüm providerları {slug: id} sözlüğü olarak döndürür."""
        query = select(self.orm_model)
        result = await self.db.execute(query)
        providers = result.scalars().all()
        # Slug varsa slug, yoksa ismi (lower/snake_case) kullan
        return {p.slug or p.name.lower().replace(" ", "_"): p.id for p in providers}
