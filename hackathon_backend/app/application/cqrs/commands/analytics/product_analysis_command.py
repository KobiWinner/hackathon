from typing import Any, Dict, Optional

from app.application.pipelines.analytics.product_analysis_pipeline import ProductAnalysisPipeline
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_currency_service import ICurrencyService


class ProductAnalysisCommandService:
    """
    Ürün analizi ile ilgili komutları yöneten servis.
    """

    def __init__(self, uow: IUnitOfWork, currency_service: ICurrencyService) -> None:
        self.uow = uow
        self.currency_service = currency_service

    async def analyze_product(self, product_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Gelen ham ürün verisini analiz pipeline'ı üzerinden işler.
        Hata durumunda None döner.
        """
        async with self.uow:
            pipeline = ProductAnalysisPipeline(self.uow, self.currency_service)
            context = await pipeline.execute(data=product_data)

            if not context.is_valid:
                # Hata varsa, logla ve None dön.
                print(f"Pipeline errors: {context.errors}")
                return None

            # Başarılı ise context'in sonucunu (işlenmiş veri) döndür.
            return context.result
