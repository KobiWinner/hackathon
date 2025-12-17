from typing import Optional

from sqlalchemy import select

# Actually, I should use the ORM model directly or the Entity if it's separated.
# The codebase uses 'app.persistence.models.products.product' as the ORM model.
# Let's check imports in other repos. ProviderRepository used 'app.persistence.models.providers.provider'.
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.products.product import Product

class ProductRepository(BaseRepository):
    orm_model = Product

    async def get_by_name(self, name: str) -> Optional[Product]:
        query = select(self.orm_model).where(self.orm_model.name == name)
        result = await self.db.execute(query)
        return result.scalars().first()
