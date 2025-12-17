from app.application.pipelines.analytics.steps.find_or_create_mapping_step import (
    FindOrCreateMappingStep,
)
from app.application.pipelines.analytics.steps.match_product_step import (
    MatchProductStep,
)
from app.application.pipelines.analytics.steps.normalize_currency_step import (
    NormalizeCurrencyStep,
)
from app.application.pipelines.analytics.steps.reliability_weighting_step import (
    ReliabilityWeightingStep,
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
    3. MatchProductStep: Ürün eşleştirmesi yapar
    4. SavePriceHistoryStep: Fiyat geçmişini kaydeder
    5. TrendAnalysisStep: Fiyat trendini analiz eder
    6. ReliabilityWeightingStep: Provider güvenilirlik ağırlıklandırması
    """

    def __init__(self, uow: IUnitOfWork, currency_service: ICurrencyService) -> None:
        super().__init__(uow)

        # Adım 1: Para Birimini ve Fiyatı Normalize Et
        self.add_step(NormalizeCurrencyStep(currency_service))

        # Adım 2: Provider Mapping Bul veya Oluştur
        self.add_step(FindOrCreateMappingStep(uow))

        # Adım 3: Ürün Eşleştirme (Product Matching)
        self.add_step(MatchProductStep(uow))

        # Adım 4: Fiyat Geçmişini Kaydet
        self.add_step(SavePriceHistoryStep(uow))

        # Adım 5: Trend Analizi
        self.add_step(TrendAnalysisStep(uow))

        # Adım 6: Güvenilirlik Ağırlıklandırması
        self.add_step(ReliabilityWeightingStep(uow))
