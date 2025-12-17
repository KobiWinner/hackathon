from typing import Optional, Type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.i_repositories.i_product_mapping_repository import (
    IProductMappingRepository,
)
from app.domain.schemas.products.product_mapping import (
    ProductMapping as ProductMappingSchema,
    ProductMappingCreate,
)
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.products.product_mappings import (
    ProductMapping as ProductMappingModel,
)


class ProductMappingRepository(BaseRepository, IProductMappingRepository):
    """
    Product Mapping Repository Implementation.
    Provider-Product eşleştirmeleri için CRUD ve özel sorgu metodları.
    """

    orm_model: Type[ProductMappingModel] = ProductMappingModel
    schema_class: Type[ProductMappingSchema] = ProductMappingSchema

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_by_provider_and_code(
        self, provider_id: int, external_product_code: str
    ) -> Optional[ProductMappingSchema]:
        """
        Provider ID ve external code kombinasyonuna göre mapping getirir.
        """
        result = await self.db.execute(
            select(ProductMappingModel).where(
                ProductMappingModel.provider_id == provider_id,
                ProductMappingModel.external_product_code == external_product_code,
            )
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore

    async def find_or_create(
        self,
        provider_id: int,
        external_product_code: str,
        product_url: Optional[str] = None,
    ) -> ProductMappingSchema:
        """
        Provider ID ve external code'a göre mapping bul veya yoksa oluştur.
        """
        # Önce mevcut kaydı ara
        existing = await self.get_by_provider_and_code(provider_id, external_product_code)
        if existing:
            return existing

        # Yoksa yeni oluştur
        create_data = ProductMappingCreate(
            provider_id=provider_id,
            external_product_code=external_product_code,
            product_url=product_url,
        )
        return await self.create(obj_in=create_data, commit=False)  # type: ignore

    async def get_orm(self, mapping_id: int) -> Optional[ProductMappingModel]:
        """
        ORM entity olarak mapping getirir (SQLAlchemy dirty tracking için).
        Schema yerine doğrudan ORM entity döndürür.
        """
        result = await self.db.execute(
            select(ProductMappingModel).where(ProductMappingModel.id == mapping_id)
        )
        return result.scalars().first()
