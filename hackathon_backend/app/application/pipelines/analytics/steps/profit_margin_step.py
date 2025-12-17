"""
ProfitMarginStep - Kar marjı ve arbitraj fırsatı hesaplama.
Ürünün tüm provider'lardaki fiyat geçmişinden market avg hesaplar.
Kaynak güvenilirlik ağırlıklandırması içerir.
"""

from decimal import Decimal
from typing import Any, Dict, List, Optional

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork


# Provider güvenilirlik skorları (0.0 - 1.0)
PROVIDER_RELIABILITY_WEIGHTS = {
    "sport_direct": 0.99,   # %1 hata → %99 güvenilir
    "outdoor_pro": 0.95,    # %5 hata → %95 güvenilir
    "dag_spor": 0.85,       # %15 hata → %85 güvenilir
    "alpine_gear": 0.70,    # %30 hata → %70 güvenilir
}

DEFAULT_RELIABILITY_WEIGHT = 0.80


class ProfitMarginStep(BaseStep):
    """
    Her ürün için kar marjı hesaplar.
    Kaynak güvenilirliğini ağırlık olarak kullanır.

    1. Ürünün veritabanındaki tüm fiyat geçmişinden market ortalamasını çeker
    2. Mevcut fiyatı market ortalamasıyla karşılaştırır
    3. Kar marjını hesaplar (güvenilirlik ağırlıklı)
    4. Arbitraj fırsatlarını işaretler

    Çıktı alanları:
    - market_avg_price: Tüm provider'ların ortalama fiyatı
    - profit_margin_percent: Bu provider'ın fiyatı market avg'ye göre kar marjı
    - weighted_profit_margin: Güvenilirlik ağırlıklı kar marjı
    - is_arbitrage_opportunity: Kar marjı eşik değerini aşıyor mu?
    """

    # Arbitraj fırsat eşiği (%)
    DEFAULT_ARBITRAGE_THRESHOLD = 10.0
    # Market avg için kullanılacak maksimum fiyat noktası sayısı
    MARKET_HISTORY_LIMIT = 50

    def __init__(
        self,
        uow: IUnitOfWork,
        arbitrage_threshold: float = DEFAULT_ARBITRAGE_THRESHOLD,
    ) -> None:
        self.uow = uow
        self.arbitrage_threshold = arbitrage_threshold

    def _get_reliability_weight(self, provider: Optional[str]) -> float:
        """Provider için güvenilirlik ağırlığını döndür."""
        if not provider:
            return DEFAULT_RELIABILITY_WEIGHT
        
        provider_key = str(provider).lower().replace("-", "_")
        return PROVIDER_RELIABILITY_WEIGHTS.get(provider_key, DEFAULT_RELIABILITY_WEIGHT)

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            return

        enriched_products: List[Dict[str, Any]] = []
        arbitrage_count = 0
        errors: List[str] = []

        for product in products:
            price = product.get("price")
            mapping_id = product.get("mapping_id")
            provider = product.get("provider")

            if price is None:
                enriched_products.append(product)
                continue

            try:
                # Güvenilirlik ağırlığını al
                reliability_weight = self._get_reliability_weight(provider)

                # 1. Market ortalamasını belirle
                market_avg = await self._get_market_average(product, mapping_id)

                if market_avg is None or market_avg == 0:
                    # Market verisi yok, sadece mevcut veriyi geçir
                    enriched = product.copy()
                    enriched["has_market_data"] = False
                    enriched_products.append(enriched)
                    continue

                # 2. Kar marjı hesapla
                # Formül: ((market_avg - price) / market_avg) * 100
                # Pozitif = bu provider daha ucuz (satılırsa kar potansiyeli)
                # Negatif = bu provider daha pahalı
                margin_percent = ((market_avg - price) / market_avg) * 100

                # 3. Güvenilirlik ağırlıklı kar marjı
                weighted_margin = margin_percent * reliability_weight

                # 4. Arbitraj fırsatı kontrolü (ağırlıklı marja göre)
                is_arbitrage = weighted_margin >= self.arbitrage_threshold

                if is_arbitrage:
                    arbitrage_count += 1

                # 5. Ürüne metrikleri ekle
                enriched = product.copy()
                enriched.update({
                    "market_avg_price": round(market_avg, 2),
                    "profit_margin_percent": round(margin_percent, 2),
                    "weighted_profit_margin": round(weighted_margin, 2),
                    "reliability_weight": reliability_weight,
                    "is_arbitrage_opportunity": is_arbitrage,
                    "has_market_data": True,
                })
                enriched_products.append(enriched)

            except Exception as e:
                errors.append(f"Mapping {mapping_id}: Kar marjı hesaplama hatası: {e}")
                enriched_products.append(product)

        context.data = enriched_products
        context.result = enriched_products
        context.errors.extend(errors)

        # Meta bilgiler
        context.meta["arbitrage_opportunities"] = arbitrage_count
        context.meta["profit_margin_errors"] = len(errors)

    async def _get_market_average(
        self, product: Dict[str, Any], mapping_id: Optional[int]
    ) -> Optional[float]:
        """
        Ürün için market ortalamasını hesaplar.

        Öncelik:
        1. TrendAnalysisStep'ten gelen avg_price (zaten fiyat geçmişinden hesaplanmış)
        2. Veritabanından taze hesaplama
        """
        # TrendAnalysis'ten gelen avg_price varsa kullan
        if product.get("avg_price") is not None:
            return float(product["avg_price"])

        # Yoksa DB'den çek
        if mapping_id:
            history = await self.uow.price_histories.get_by_mapping_id(
                mapping_id, limit=self.MARKET_HISTORY_LIMIT
            )
            if history and len(history) >= 1:
                prices = [float(h.price) for h in history]
                return sum(prices) / len(prices)

        return None
