"""
Exchange Rate Provider - Infrastructure Layer Implementation.
HTTP client detayları bu katmanda kapsüllenir.
"""

from typing import Dict

import httpx

from app.core.config.settings import settings
from app.domain.i_services.i_exchange_rate_provider import IExchangeRateProvider


class ExchangeRateApiProvider(IExchangeRateProvider):
    """
    Harici API'den döviz kurlarını çeken provider.
    Onion Architecture gereği HTTP client sadece Infrastructure katmanında bulunur.
    """

    FALLBACK_RATES: Dict[str, float] = {
        "USD": 34.20,
        "EUR": 37.50,
        "GBP": 43.10,
        "TRY": 1.0,
    }

    async def get_rates(self) -> Dict[str, float]:
        """
        Güncel kurları API'den getirir.
        Hata durumunda fallback değerler döner.

        Dönen değerler: 1 Birim Yabancı Para = Kaç TRY (Örn: USD: 34.20)
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(settings.EXCHANGE_RATE_API, timeout=3.0)
                response.raise_for_status()
                data = response.json()

                rates = data.get("rates", {})

                # Eğer API yanıtında TRY varsa, çapraz kur hesabı yap
                if "TRY" in rates:
                    base_rate_try = rates["TRY"]  # Örn: 1 Base (EUR) = 34 TRY

                    converted_rates: Dict[str, float] = {}
                    for currency, rate in rates.items():
                        if rate == 0:
                            continue
                        # Formül: (Base -> TRY) / (Base -> Currency) = Currency -> TRY
                        converted_rates[currency] = base_rate_try / rate

                    converted_rates["TRY"] = 1.0
                    return converted_rates
                else:
                    return self.FALLBACK_RATES

        except (
            httpx.HTTPStatusError,
            httpx.RequestError,
            KeyError,
            ZeroDivisionError,
        ) as e:
            print(f"Döviz kuru API hatası: {e}")
            return self.FALLBACK_RATES
