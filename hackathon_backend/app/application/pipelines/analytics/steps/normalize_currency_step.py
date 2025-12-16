from typing import Any, Dict, List

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_services.i_currency_service import ICurrencyService


class NormalizeCurrencyStep(BaseStep):
    """
    Batch ürün verisini işler:
    1. Kurları cache'ten veya API'den tek seferde çeker (batch optimizasyonu)
    2. Her ürünün fiyatını TRY'ye çevirir
    3. Fiyat formatını temizler ("$1,200.00" -> 1200.0)
    4. Orijinal veriyi (original_price, original_currency) saklar
    """

    def __init__(self, currency_service: ICurrencyService) -> None:
        self.currency_service = currency_service

    async def process(self, context: PipelineContext) -> None:
        products: List[Dict[str, Any]] = context.data

        if not products:
            context.errors.append("Boş ürün listesi alındı.")
            return

        # 1. Kurları batch başında tek seferde çek (cache'li)
        exchange_rates = await self.currency_service.get_exchange_rates()

        # 2. Her ürünü işle
        normalized_products: List[Dict[str, Any]] = []
        errors: List[str] = []

        for product in products:
            result = self._normalize_single(product, exchange_rates)
            if result["success"]:
                normalized_products.append(result["data"])
            else:
                errors.append(result["error"])

        # 3. Sonuçları context'e yaz
        context.data = normalized_products
        context.result = normalized_products
        context.errors.extend(errors)

        # Meta bilgi ekle
        context.meta["total_products"] = len(products)
        context.meta["normalized_count"] = len(normalized_products)
        context.meta["error_count"] = len(errors)

    def _normalize_single(
        self, product: Dict[str, Any], rates: Dict[str, float]
    ) -> Dict[str, Any]:
        """Tek bir ürünün fiyatını normalize eder."""
        external_id = product.get("id", "unknown")
        raw_price = product.get("price")
        raw_currency = product.get("currency", "TRY")

        # Fiyat kontrolü
        if raw_price is None:
            return {
                "success": False,
                "error": f"ID {external_id}: Fiyat bilgisi bulunamadı.",
            }

        # Fiyat parse
        try:
            price_float = self._parse_price(raw_price)
        except ValueError as e:
            return {"success": False, "error": f"ID {external_id}: {e}"}

        # Döviz çevirisi
        currency_upper = raw_currency.upper()
        if currency_upper == "TRY":
            price_in_try = price_float
        else:
            rate = rates.get(currency_upper)
            if not rate:
                return {
                    "success": False,
                    "error": f"ID {external_id}: {currency_upper} için kur bulunamadı.",
                }
            price_in_try = price_float * rate

        # Sonucu oluştur
        normalized = product.copy()
        normalized["original_price"] = price_float
        normalized["original_currency"] = raw_currency
        normalized["price"] = round(price_in_try, 2)
        normalized["currency"] = "TRY"

        return {"success": True, "data": normalized}

    def _parse_price(self, raw_price: Any) -> float:
        """Fiyat string'ini float'a çevirir."""
        if isinstance(raw_price, (int, float)):
            return float(raw_price)

        if not isinstance(raw_price, str):
            raise ValueError(f"Geçersiz fiyat tipi: {type(raw_price)}")

        # Sembol ve boşlukları temizle
        clean_str = (
            raw_price.replace("$", "")
            .replace("€", "")
            .replace("£", "")
            .replace("TL", "")
            .replace("₺", "")
            .strip()
        )

        # Amerikan vs Avrupa formatı
        dot_pos = clean_str.rfind(".")
        comma_pos = clean_str.rfind(",")

        if dot_pos > comma_pos:
            # Amerikan formatı: 1,234.56
            clean_str = clean_str.replace(",", "")
        elif comma_pos > dot_pos:
            # Avrupa formatı: 1.234,56
            clean_str = clean_str.replace(".", "").replace(",", ".")
        else:
            # Sadece virgül varsa ondalık ayracı olduğunu varsay
            clean_str = clean_str.replace(",", ".")

        try:
            return float(clean_str)
        except ValueError:
            raise ValueError(f"Fiyat parse edilemedi: '{raw_price}'")

