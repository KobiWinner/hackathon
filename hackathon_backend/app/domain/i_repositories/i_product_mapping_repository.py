from abc import ABC, abstractmethod
from typing import Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.products.product_mapping import (
    ProductMapping,
    ProductMappingCreate,
    ProductMappingUpdate,
)


class IProductMappingRepository(
    IBaseRepository[ProductMapping, ProductMappingCreate, ProductMappingUpdate], ABC
):
    """
    Product Mapping Repository Interface.
    Provider-Product eşleştirmeleri için özel metodları tanımlar.
    """

    @abstractmethod
    async def get_by_provider_and_code(
        self, provider_id: int, external_product_code: str
    ) -> Optional[ProductMapping]:
        """
        Provider ID ve external code kombinasyonuna göre mapping getirir.
        UniqueConstraint sayesinde en fazla 1 sonuç döner.
        """
        raise NotImplementedError

    @abstractmethod
    async def find_or_create(
        self, provider_id: int, external_product_code: str, product_url: Optional[str] = None
    ) -> ProductMapping:
        """
        Provider ID ve external code'a göre mapping bul veya yoksa oluştur.
        Upsert mantığı.
        """
        raise NotImplementedError
