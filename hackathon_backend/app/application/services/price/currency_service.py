"""
Currency Service - Application Layer.
Döviz kuru işlemlerini yönetir, cache ve provider ile çalışır.
"""

from typing import Dict, Optional

from app.domain.i_services.i_cache_service import ICacheService
from app.domain.i_services.i_currency_service import ICurrencyService
from app.domain.i_services.i_exchange_rate_provider import IExchangeRateProvider


class CurrencyService(ICurrencyService):
    """
    Döviz kurlarını yöneten servis.
    Cache desteği ile API çağrılarını optimize eder.
    """

    CACHE_KEY = "exchange_rates"
    CACHE_TTL = 300  # 5 dakika

    def __init__(
        self,
        exchange_rate_provider: IExchangeRateProvider,
        cache_service: Optional[ICacheService] = None,
    ) -> None:
        self.exchange_rate_provider = exchange_rate_provider
        self.cache_service = cache_service

    async def get_exchange_rates(self) -> Dict[str, float]:
        """
        Güncel kurları cache'ten veya provider'dan getirir.
        Dönen değerler: 1 Birim Yabancı Para = Kaç TRY (Örn: USD: 34.20)
        """
        # 1. Cache kontrol
        if self.cache_service:
            cached_rates = await self.cache_service.get(self.CACHE_KEY)
            if cached_rates:
                return cached_rates

        # 2. Provider'dan çek
        rates = await self.exchange_rate_provider.get_rates()

        # 3. Cache'e kaydet
        if self.cache_service:
            await self.cache_service.set(self.CACHE_KEY, rates, expire=self.CACHE_TTL)

        return rates

    async def convert_price(self, amount: float, currency: str) -> float:
        """Verilen parayı TL'ye çevirir."""
        currency_upper = currency.upper()
        if currency_upper == "TRY":
            return amount

        rates = await self.get_exchange_rates()
        rate = rates.get(currency_upper)

        if not rate:
            print(f"Uyarı: {currency_upper} için kur bulunamadı.")
            return amount

        return round(amount * rate, 2)
