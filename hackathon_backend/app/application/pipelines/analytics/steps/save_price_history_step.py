"""
SavePriceHistoryStep - Fiyat geçmişini veritabanına kaydeder.
Trend analizi için fiyat verilerini biriktirir.
"""

from decimal import Decimal
from typing import Any, Dict, List

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.schemas.price.price_history import PriceHistoryCreate


class SavePriceHistoryStep(BaseStep):
    """
    Normalize edilmiş ve mapping_id atanmış ürünlerin fiyatlarını
    price_histories tablosuna kaydeder.

    Input: List of products with mapping_id, price, original_price, currency
    Output: Same products (unchanged), saved records in meta
    """

    def __init__(self, uow: IUnitOfWork) -> None:
        self.uow = uow
        self._currency_cache: Dict[str, int] = {}

    async def _get_currency_id(self, currency_code: str) -> int | None:
        """Currency kodundan ID'yi çözer, cache kullanır."""
        if not self._currency_cache:
            # Tüm currency'leri bir kez yükle
            currencies = await self.uow.currencies.get_all()
            self._currency_cache = {c.code: c.id for c in currencies}
        return self._currency_cache.get(currency_code.upper())

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            return

        price_records: List[PriceHistoryCreate] = []
        errors: List[str] = []

        for product in products:
            mapping_id = product.get("mapping_id")
            price = product.get("price")

            if not mapping_id:
                external_id = product.get("external_product_code") or product.get("id")
                errors.append(f"ID {external_id}: mapping_id eksik, fiyat kaydedilmedi.")
                continue

            if price is None:
                errors.append(f"Mapping {mapping_id}: price eksik.")
                continue

            # Currency kodundan ID çöz
            currency_code = product.get("currency", "TRY")
            currency_id = await self._get_currency_id(currency_code)
            if not currency_id:
                errors.append(f"Mapping {mapping_id}: currency '{currency_code}' bulunamadı.")
                continue

            try:
                record = PriceHistoryCreate(
                    mapping_id=mapping_id,
                    price=Decimal(str(price)),
                    original_price=(
                        Decimal(str(product["original_price"]))
                        if product.get("original_price")
                        else None
                    ),
                    discount_rate=product.get("discount_rate"),
                    currency_id=currency_id,
                    in_stock=product.get("in_stock", True),
                    stock_quantity=product.get("stock_quantity"),
                )
                price_records.append(record)
            except Exception as e:
                errors.append(f"Mapping {mapping_id}: Record oluşturma hatası: {e}")

        # Batch insert
        if price_records:
            try:
                saved = await self.uow.price_histories.create_bulk(
                    items=price_records, commit=False
                )
                context.meta["saved_price_records"] = len(saved)
            except Exception as e:
                errors.append(f"Batch insert hatası: {e}")
                context.meta["saved_price_records"] = 0
        else:
            context.meta["saved_price_records"] = 0

        context.errors.extend(errors)
        context.meta["price_save_errors"] = len(errors)

        # Data değişmez, sadece kaydedildi
        context.result = context.data

