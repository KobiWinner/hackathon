"""Pipeline step to update trending products table."""

from typing import Any, Dict, List

from sqlalchemy import delete

from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.persistence.models.analytics.trending_product import TrendingProduct
from app.application.pipelines.base import BaseStep, PipelineContext


class UpdateTrendingStep(BaseStep):
    """
    TrendAnalysisStep sonrası çalışır.
    En yüksek trend_score'a sahip 5 ürünü trending_products tablosuna yazar.
    """

    TOP_N = 5  # Kaç ürün saklanacak

    def __init__(self, uow: IUnitOfWork) -> None:
        self.uow = uow

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data or []

        if not products:
            return

        # Sadece trend_score ve product_id olan ürünleri filtrele
        scored_products = [
            p for p in products
            if p.get("trend_score") is not None and p.get("product_id") is not None
        ]

        if not scored_products:
            context.meta["trending_updated"] = 0
            return

        # En yüksek absolute trend score'a göre sırala
        # (hem artış hem düşüş trendi "trending" sayılır)
        sorted_products = sorted(
            scored_products,
            key=lambda x: abs(x.get("trend_score", 0)),
            reverse=True
        )[:self.TOP_N]

        # Mevcut trending kayıtlarını temizle
        await self.uow.db.execute(delete(TrendingProduct))

        # Yeni trending kayıtlarını ekle
        trending_records = []
        for rank, product in enumerate(sorted_products, start=1):
            trending_records.append(
                TrendingProduct(
                    product_id=product["product_id"],
                    trend_score=product["trend_score"],
                    rank=rank,
                )
            )

        self.uow.db.add_all(trending_records)

        context.meta["trending_updated"] = len(trending_records)
