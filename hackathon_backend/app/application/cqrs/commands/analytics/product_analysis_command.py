from typing import Any, Dict, List, Optional

from app.application.pipelines.analytics.product_analysis_pipeline import (
    ProductAnalysisPipeline,
)
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_currency_service import ICurrencyService


class ProductAnalysisCommandService:
    """
    Ürün analizi ile ilgili komutları yöneten servis.
    """

    def __init__(self, uow: IUnitOfWork, currency_service: ICurrencyService) -> None:
        self.uow = uow
        self.currency_service = currency_service

    async def analyze_products_batch(
        self, products: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Batch ürün verisini analiz pipeline'ı üzerinden işler.

        Returns:
            Dict containing:
            - normalized_products: List of successfully processed products
            - errors: List of error messages
            - meta: Processing statistics
        """
        async with self.uow:
            pipeline = ProductAnalysisPipeline(self.uow, self.currency_service)
            context = await pipeline.execute(data=products)

            return {
                "normalized_products": context.result or [],
                "errors": context.errors,
                "meta": context.meta,
            }

    async def analyze_product(
        self, product_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Tek bir ürünü analiz eder (geriye uyumluluk için).
        """
        result = await self.analyze_products_batch([product_data])

        if result["normalized_products"]:
            return result["normalized_products"][0]
        return None
