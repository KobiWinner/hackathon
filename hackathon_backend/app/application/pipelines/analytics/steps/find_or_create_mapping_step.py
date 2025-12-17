"""
FindOrCreateMappingStep - Provider ürün eşleştirmesi.
External product code + provider_id → mapping_id bul veya oluştur.
"""

from typing import Any, Dict, List

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork


class FindOrCreateMappingStep(BaseStep):
    """
    Batch ürünler için ProductMapping kayıtlarını bulur veya oluşturur.

    Input: List of products with provider_id ve external_product_code
    Output: Same products with mapping_id added
    """

    def __init__(self, uow: IUnitOfWork) -> None:
        self.uow = uow

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            return

        enriched_products: List[Dict[str, Any]] = []
        errors: List[str] = []

        for product in products:
            provider_id = product.get("provider_id")
            external_code = product.get("external_product_code") or product.get("id")
            product_url = product.get("product_url")

            # Validation
            if not provider_id:
                errors.append(
                    f"ID {external_code}: provider_id eksik, mapping oluşturulamadı."
                )
                continue

            if not external_code:
                errors.append("Ürün external_product_code veya id içermiyor.")
                continue

            try:
                # Find or create mapping
                mapping = await self.uow.product_mappings.find_or_create(
                    provider_id=provider_id,
                    external_product_code=str(external_code),
                    product_url=product_url,
                )

                # Add mapping_id to product
                enriched = product.copy()
                enriched["mapping_id"] = mapping.id
                enriched["existing_product_id"] = mapping.product_id
                enriched_products.append(enriched)

            except Exception as e:
                errors.append(f"ID {external_code}: Mapping hatası: {e}")

        context.data = enriched_products
        context.result = enriched_products
        context.errors.extend(errors)

        # Meta bilgiler
        context.meta["mappings_processed"] = len(enriched_products)
        context.meta["mapping_errors"] = len(errors)
