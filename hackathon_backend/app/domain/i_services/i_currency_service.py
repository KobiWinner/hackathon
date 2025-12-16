from abc import ABC, abstractmethod
from typing import Dict


class ICurrencyService(ABC):
    """
    Currency Service Interface.
    Döviz kuru işlemlerini soyutlar.
    """

    @abstractmethod
    async def get_exchange_rates(self) -> Dict[str, float]:
        """
        Tüm döviz kurlarını getirir.

        :return: Kur kodları ve oranlarını içeren bir sözlük.
        """
        raise NotImplementedError

    @abstractmethod
    async def convert_price(self, amount: float, currency: str) -> float:
        """
        Belirtilen miktarı ve para birimini ana para birimine (örn: TRY) çevirir.

        :param amount: Çevrilecek miktar.
        :param currency: Miktarın mevcut para birimi kodu (örn: "USD").
        :return: Çevrilmiş miktar.
        """
        raise NotImplementedError
