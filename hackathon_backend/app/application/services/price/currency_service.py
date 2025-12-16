import httpx
from typing import Dict

from app.core.config.settings import settings
from app.domain.i_services.i_currency_service import ICurrencyService


class CurrencyService(ICurrencyService):
    """
    Döviz kurlarını yöneten servis.
    """
    FALLBACK_RATES = {
        "USD": 34.20,
        "EUR": 37.50,
        "GBP": 43.10,
        "TRY": 1.0
    }

    async def get_exchange_rates(self) -> Dict[str, float]:
        """
        Güncel kurları API'den veya bir hata durumunda fallback değerlerden getirir.
        Dönen değerler: 1 Birim Yabancı Para = Kaç TRY (Örn: USD: 34.20)
        """
        # TODO: Redis cache eklenmeli.
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    settings.EXCHANGE_RATE_API,
                    timeout=3.0
                )
                response.raise_for_status()
                data = response.json()

                rates = data.get("rates", {})
                
                # Eğer API yanıtında TRY varsa, çapraz kur hesabı yapabiliriz.
                if "TRY" in rates:
                    base_rate_try = rates["TRY"] # Örn: 1 Base (EUR) = 34 TRY
                    
                    converted_rates = {}
                    for currency, rate in rates.items():
                        if rate == 0: continue
                        # Formül: (Base -> TRY) / (Base -> Currency) = Currency -> TRY
                        # Örn: 34 (TRY/EUR) / 1.1 (USD/EUR) = 30.9 (TRY/USD)
                        converted_rates[currency] = base_rate_try / rate
                    
                    converted_rates["TRY"] = 1.0
                    return converted_rates
                else:
                    # TRY yoksa veya yapı farklıysa fallback dön
                    return self.FALLBACK_RATES

        except (httpx.HTTPStatusError, httpx.RequestError, KeyError, ZeroDivisionError) as e:
            print(f"Döviz kuru API hatası: {e}")
            return self.FALLBACK_RATES

    async def convert_price(self, amount: float, currency: str) -> float:
        """
        Verilen parayı TL'ye çevirir.
        """
        currency_upper = currency.upper()
        if currency_upper == "TRY":
            return amount

        rates = await self.get_exchange_rates()
        rate = rates.get(currency_upper)

        if not rate:
            print(f"Uyarı: {currency_upper} için kur bulunamadı.")
            return amount

        # Artık rate "1 Birim Para = X TL" formatında olduğu için çarpma işlemi doğru.
        return round(amount * rate, 2)
