from typing import Any, Dict, List

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.persistence.models.products.product import Product


class MatchProductStep(BaseStep):
    """
    ProductMapping kayıtlarını bir 'Product' (Ana Ürün) ile eşleştirir.
    Eğer eşleşen ürün yoksa yeni ürün oluşturur.

    Heuristic:
    1. İsim normalizasyonu (lowercase, trim).
    2. Exact match.
    """

    def __init__(self, uow: IUnitOfWork) -> None:
        self.uow = uow

    def _normalize_name(self, name: str) -> str:
        """Basit isim temizleme."""
        if not name:
            return ""
        # 1. Lowercase
        name = name.lower()
        # 2. Gereksiz boşlukları sil
        name = " ".join(name.split())
        return name

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data
        if not products:
            return

        matched_count = 0
        created_count = 0
        errors = []

        for item in products:
            mapping_id = item.get("mapping_id")
            existing_product_id = item.get("existing_product_id")

            # Eğer zaten bir ürüne bağlıysa geç
            if existing_product_id:
                item["product_id"] = existing_product_id
                matched_count += 1
                continue

            if not mapping_id:
                continue

            # Eşleştirme Mantığı
            raw_name = item.get("name", "")
            normalized_name = self._normalize_name(raw_name)

            if not normalized_name:
                errors.append(f"Mapping {mapping_id}: Geçersiz isim '{raw_name}'")
                continue

            try:
                # 1. Mevcut ürünü isme göre ara
                product = await self.uow.products.get_by_name(normalized_name)

                if not product:
                    # 2. Yoksa yeni oluştur
                    slug = normalized_name.replace(" ", "-")

                    product = Product(
                        name=normalized_name,
                        slug=slug,
                        description=item.get("description"),
                    )
                    self.uow.products.db.add(product)
                    await self.uow.session.flush()  # ID almak için flush
                    created_count += 1
                else:
                    matched_count += 1

                # 3. Mapping'i güncelle - product_id ataması (ORM entity gerekli)
                mapping = await self.uow.product_mappings.get_orm(mapping_id)
                if mapping:
                    mapping.product_id = product.id
                    # SQLAlchemy dirty tracking ile güncellenir, flush yapılacak

                # Context güncelle
                item["product_id"] = product.id
                item["product_name"] = product.name

            except Exception as e:
                errors.append(f"Mapping {mapping_id}: Eşleştirme hatası: {e}")

        # Tüm mapping güncellemelerini veritabanına yaz
        try:
            await self.uow.session.flush()
        except Exception as e:
            errors.append(f"Mapping güncellemeleri kaydedilemedi: {e}")

        # Meta güncelleme
        context.meta["products_matched_existing"] = matched_count
        context.meta["products_created"] = created_count
        if errors:
            context.errors.extend(errors)

        # Result'ı ayarla (bir sonraki step için)
        context.result = products

