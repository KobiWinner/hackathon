"""
TrendAnalysisStep - Fiyat trend analizi.
Geçmiş fiyat verilerine bakarak trend score hesaplar.
"""

from decimal import Decimal
from typing import Any, Dict, List, Optional

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork


class TrendAnalysisStep(BaseStep):
    """
    Her ürün için fiyat geçmişine bakarak trend analizi yapar.

    Hesaplanan metrikler:
    - trend_score: -100 ile +100 arası (negatif = düşüş, pozitif = artış)
    - price_change_percent: Son fiyatın ortalamaya göre değişimi (%)
    - trend_direction: "up", "down", "stable"
    - avg_price: Ortalama fiyat
    - min_price: Minimum fiyat
    - max_price: Maksimum fiyat
    """

    # Varsayılan config
    DEFAULT_HISTORY_LIMIT = 10  # Son kaç fiyat noktası
    STABLE_THRESHOLD = 2.0  # ±%2 içinde stable kabul et

    def __init__(
        self, uow: IUnitOfWork, history_limit: int = DEFAULT_HISTORY_LIMIT
    ) -> None:
        self.uow = uow
        self.history_limit = history_limit

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            return

        analyzed_products: List[Dict[str, Any]] = []
        errors: List[str] = []

        for product in products:
            mapping_id = product.get("mapping_id")
            current_price = product.get("price")

            if not mapping_id or current_price is None:
                # Trend analizi yapılamaz, ama ürünü geçir
                analyzed_products.append(product)
                continue

            try:
                # Fiyat geçmişini çek
                history = await self.uow.price_histories.get_by_mapping_id(
                    mapping_id, limit=self.history_limit
                )

                # Trend analizi hesapla
                analysis = self._analyze_trend(current_price, history)

                # Ürüne analiz sonuçlarını ekle
                enriched = product.copy()
                enriched.update(analysis)
                analyzed_products.append(enriched)

            except Exception as e:
                errors.append(f"Mapping {mapping_id}: Trend analizi hatası: {e}")
                analyzed_products.append(product)

        context.data = analyzed_products
        context.result = analyzed_products
        context.errors.extend(errors)

        # Meta bilgiler
        analyzed_count = sum(1 for p in analyzed_products if "trend_score" in p)
        context.meta["trend_analyzed_count"] = analyzed_count
        context.meta["trend_analysis_errors"] = len(errors)

    def _analyze_trend(
        self, current_price: float, history: List[Any]
    ) -> Dict[str, Any]:
        """
        Fiyat geçmişinden trend metrikleri hesaplar.
        """
        # Yeterli veri yoksa nötr döndür
        if not history or len(history) < 2:
            return {
                "trend_score": 0,
                "trend_direction": "stable",
                "price_change_percent": 0.0,
                "avg_price": current_price,
                "min_price": current_price,
                "max_price": current_price,
                "has_sufficient_data": False,
            }

        # Fiyatları çıkar (Decimal -> float)
        prices = [float(h.price) for h in history]

        # Temel istatistikler
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)

        # Değişim yüzdesi hesapla
        if avg_price > 0:
            change_percent = ((current_price - avg_price) / avg_price) * 100
        else:
            change_percent = 0.0

        # Trend yönü belirle
        if abs(change_percent) <= self.STABLE_THRESHOLD:
            direction = "stable"
        elif change_percent > 0:
            direction = "up"
        else:
            direction = "down"

        # Trend score hesapla (-100 ile +100 arası)
        # Basit formül: değişim yüzdesini -100/+100 aralığına sıkıştır
        trend_score = self._calculate_trend_score(prices, current_price, change_percent)

        return {
            "trend_score": trend_score,
            "trend_direction": direction,
            "price_change_percent": round(change_percent, 2),
            "avg_price": round(avg_price, 2),
            "min_price": round(min_price, 2),
            "max_price": round(max_price, 2),
            "has_sufficient_data": True,
        }

    def _calculate_trend_score(
        self, prices: List[float], current_price: float, change_percent: float
    ) -> int:
        """
        Trend score hesaplar (-100 ile +100).

        Faktörler:
        1. Değişim yüzdesi (ana faktör)
        2. Son fiyatların yönü (momentum)
        """
        # Ana skor: değişim yüzdesine göre
        # %10+ değişim = ±50 skor, %20+ = ±100
        base_score = min(max(change_percent * 5, -100), 100)

        # Momentum: son 3 fiyatın yönü
        if len(prices) >= 3:
            recent = prices[:3]  # En yeni 3 kayıt
            if all(recent[i] <= recent[i + 1] for i in range(len(recent) - 1)):
                # Sürekli düşüş (tarihe göre: yeni → eski, düşüyorsa değer artıyor)
                momentum_bonus = -10
            elif all(recent[i] >= recent[i + 1] for i in range(len(recent) - 1)):
                # Sürekli artış
                momentum_bonus = 10
            else:
                momentum_bonus = 0
        else:
            momentum_bonus = 0

        final_score = base_score + momentum_bonus
        return int(min(max(final_score, -100), 100))
