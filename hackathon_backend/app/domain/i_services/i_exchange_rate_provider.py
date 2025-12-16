from abc import ABC, abstractmethod
from typing import Dict


class IExchangeRateProvider(ABC):
    """
    Exchange Rate Provider Interface.
    Döviz kurlarını harici kaynaklardan çekmeyi soyutlar.
    """

    @abstractmethod
    async def get_rates(self) -> Dict[str, float]:
        """
        Güncel döviz kurlarını getirir.

        :return: Para birimi kodları ve TRY karşılığı oranlarını içeren sözlük.
                 Örn: {"USD": 34.20, "EUR": 37.50, "TRY": 1.0}
        """
        raise NotImplementedError
