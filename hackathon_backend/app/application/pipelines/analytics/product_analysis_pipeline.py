from app.application.pipelines.analytics.steps.find_or_create_mapping_step import (
    FindOrCreateMappingStep,
)
from app.application.pipelines.analytics.steps.match_product_step import (
    MatchProductStep,
)
from app.application.pipelines.analytics.steps.normalize_currency_step import (
    NormalizeCurrencyStep,
)
from app.application.pipelines.analytics.steps.save_price_history_step import (
    SavePriceHistoryStep,
)
from app.application.pipelines.analytics.steps.trend_analysis_step import (
    TrendAnalysisStep,
)
from app.application.pipelines.base import BasePipeline
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_currency_service import ICurrencyService


class ProductAnalysisPipeline(BasePipeline):
    """
    Harici bir kaynaktan gelen ürün verisini analiz eden, temizleyen,
    zenginleştiren ve veritabanına kaydeden pipeline.

    Adımlar:
    1. NormalizeCurrencyStep: Fiyatları TRY'ye çevirir
    2. FindOrCreateMappingStep: Provider mapping'i bulur/oluşturur
    3. SavePriceHistoryStep: Fiyat geçmişini kaydeder
    4. TrendAnalysisStep: Fiyat trendini analiz eder
    """

    def __init__(self, uow: IUnitOfWork, currency_service: ICurrencyService) -> None:
        super().__init__(uow)

        # Adım 1: Para Birimini ve Fiyatı Normalize Et
        self.add_step(NormalizeCurrencyStep(currency_service))

        # Adım 2: Provider Mapping Bul veya Oluştur
        self.add_step(FindOrCreateMappingStep(uow))

        # Adım 2.1: Ürün Eşleştirme (Product Matching)
        self.add_step(MatchProductStep(uow))

        # Adım 3: Fiyat Geçmişini Kaydet
        self.add_step(SavePriceHistoryStep(uow))

        # Adım 4: Trend Analizi
        self.add_step(TrendAnalysisStep(uow))

        # --- Gelecekteki Adımlar ---
        # self.add_step(ArbitrageDetectionStep(...))


