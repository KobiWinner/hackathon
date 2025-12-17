"""
ReliabilityWeightingStep - Provider güvenilirlik ve veri kalitesi ağırlıklandırması.
Provider'ın reliability_score ve data_quality_score değerlerine göre
trend ve kar marjı hesaplamalarını ağırlıklandırır.
"""

from typing import Any, Dict, List, Optional

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_repositories.i_unit_of_work import IUnitOfWork


class ReliabilityWeightingStep(BaseStep):
    """
    Provider güvenilirlik skoruna göre ağırlıklandırma yapar.

    Her ürün için:
    1. Provider'ın reliability_score ve data_quality_score değerlerini alır
    2. Confidence level hesaplar
    3. Trend ve kar marjı değerlerini ağırlıklandırır

    Çıktı alanları:
    - reliability_score: Provider güvenilirlik skoru (0.00-1.00)
    - data_quality_score: Veri kalitesi skoru (0-100)
    - confidence_level: Birleşik güven seviyesi (0.00-1.00)
    - weighted_trend_score: Ağırlıklandırılmış trend skoru
    - weighted_profit_margin: Ağırlıklandırılmış kar marjı
    """

    def __init__(self, uow: IUnitOfWork) -> None:
        self.uow = uow
        self._provider_cache: Dict[int, Dict[str, Any]] = {}

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            return

        # Provider verilerini önbelleğe al
        await self._preload_providers(products)

        weighted_products: List[Dict[str, Any]] = []
        errors: List[str] = []

        for product in products:
            provider_id = product.get("provider_id")

            if not provider_id:
                weighted_products.append(product)
                continue

            try:
                # Provider verilerini al
                provider_data = self._provider_cache.get(provider_id, {})
                
                reliability = float(provider_data.get("reliability_score", 1.0))
                data_quality = provider_data.get("data_quality_score") or 50  # Default 50

                # Confidence level hesapla (0.0 - 1.0 arası)
                # reliability_score (0-1) ve data_quality_score (0-100) birleştir
                confidence_level = (reliability + (data_quality / 100)) / 2

                # Ağırlıklandırılmış değerler hesapla
                trend_score = product.get("trend_score", 0)
                profit_margin = product.get("profit_margin_percent", 0)

                weighted_trend = trend_score * reliability
                weighted_profit = profit_margin * reliability

                # Ürüne metrikleri ekle
                enriched = product.copy()
                enriched.update({
                    "reliability_score": round(reliability, 2),
                    "data_quality_score": data_quality,
                    "confidence_level": round(confidence_level, 2),
                    "weighted_trend_score": round(weighted_trend, 2),
                    "weighted_profit_margin": round(weighted_profit, 2),
                })
                weighted_products.append(enriched)

            except Exception as e:
                errors.append(f"Provider {provider_id}: Ağırlıklandırma hatası: {e}")
                weighted_products.append(product)

        context.data = weighted_products
        context.result = weighted_products
        context.errors.extend(errors)

        # Meta bilgiler
        context.meta["reliability_weighted_count"] = sum(
            1 for p in weighted_products if "confidence_level" in p
        )
        context.meta["reliability_weighting_errors"] = len(errors)

    async def _preload_providers(self, products: List[Dict[str, Any]]) -> None:
        """Provider verilerini tek sorguda önbelleğe al."""
        provider_ids = set(
            p.get("provider_id") for p in products if p.get("provider_id")
        )

        if not provider_ids:
            return

        # Tüm provider'ları çek
        for provider_id in provider_ids:
            if provider_id not in self._provider_cache:
                try:
                    provider = await self.uow.providers.get(provider_id)
                    if provider:
                        self._provider_cache[provider_id] = {
                            "reliability_score": float(provider.reliability_score or 1.0),
                            "data_quality_score": provider.data_quality_score,
                        }
                except Exception:
                    # Hata durumunda default değerler kullan
                    self._provider_cache[provider_id] = {
                        "reliability_score": 1.0,
                        "data_quality_score": 50,
                    }
