from app.application.pipelines.base import BasePipeline
from app.application.pipelines.analytics.steps.normalize_currency_step import NormalizeCurrencyStep
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork
from app.domain.i_services.i_currency_service import ICurrencyService


class ProductAnalysisPipeline(BasePipeline):
    """
    Harici bir kaynaktan gelen ürün verisini analiz eden, temizleyen,
    zenginleştiren ve veritabanına kaydeden pipeline.
    """

    def __init__(self, uow: IUnitOfWork, currency_service: ICurrencyService):
        """
        Pipeline için gerekli servisleri ve bağımlılıkları başlatır.
        """
        super().__init__(uow)

        # Adım 1: Para Birimini ve Fiyatı Normalize Et
        # Bu adım, tüm fiyatları standart bir para birimine (örn: TRY) çevirir
        # ve fiyat formatını temizler.
        self.add_step(NormalizeCurrencyStep(currency_service))

        # --- Gelecekteki Adımlar Buraya Eklenecek ---
        # Örnek:
        # self.add_step(CategorizeProductStep(categorization_service))
        # self.add_step(FindOrCreateProductStep(uow))
        # self.add_step(UpdatePriceHistoryStep(uow))
        # self.add_step(CheckForArbitrageOpportunityStep(uow))

