from typing import Any, Dict, List
import re

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
        # 3. Parantez içlerini sil (Opsiyonel - örn: "Ayakkabı (Siyah)" -> "Ayakkabı") - Şimdilik yapma
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
                    # Slug oluşturma (basit)
                    slug = normalized_name.replace(" ", "-") # Regex ile daha temiz yapılabilir
                    # Slug uniqueness check gerekebilir ama şimdilik database constraint'e güvenelim 
                    # veya try-catch ile retry edelim. Basitlik için timestamp ekleyebiliriz çakışırsa.
                    
                    product = Product(
                        name=normalized_name,
                        slug=slug, # TODO: Better slug generation
                        description=item.get("description"),
                        # image_url vs eklenebilir
                    )
                    self.uow.products.db.add(product)
                    await self.uow.commit() # ID almak için commit (veya flush)
                    # refresh(product) might be needed depending on repository impl
                    created_count += 1
                else:
                    matched_count += 1

                # 3. Mapping'i güncelle
                # Mapping reposunda update metodu var mı? Yoksa UnitOfWork üzerinden erişip SQL ile mi?
                # Mapping entity'sini çekip güncellemek en temizi.
                mapping = await self.uow.product_mappings.get(mapping_id)
                if mapping:
                    mapping.product_id = product.id
                    # await self.uow.product_mappings.update(mapping)
                
                # Context güncelle
                item["product_id"] = product.id
                item["product_name"] = product.name

            except Exception as e:
                errors.append(f"Mapping {mapping_id}: Eşleştirme hatası: {e}")

        # Meta güncelleme
        context.meta["products_matched_existing"] = matched_count
        context.meta["products_created"] = created_count
        if errors:
            context.errors.extend(errors)
