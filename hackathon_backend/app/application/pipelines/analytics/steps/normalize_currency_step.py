from typing import Any

from app.core.patterns.pipeline import BaseStep, PipelineContext
from app.domain.i_services.i_currency_service import ICurrencyService


class NormalizeCurrencyStep(BaseStep):
    """
    Bu adım:
    1. Fiyat verisini string'den float'a temizler ("$1,200.00" -> 1200.0).
    2. ICurrencyService kullanarak fiyatı ana para birimine (örn: TRY) çevirir.
    3. Orijinal veriyi (original_price, original_currency) saklar.
    """

    def __init__(self, currency_service: ICurrencyService):
        self.currency_service = currency_service

    async def process(self, context: PipelineContext) -> None:
        data: dict[str, Any] = context.data
        external_id = data.get("id", "unknown")

        raw_price = data.get("price")
        raw_currency = data.get("currency", "TRY")

        if raw_price is None:
            context.errors.append(f"ID {external_id}: Fiyat bilgisi bulunamadı, ürün atlanıyor.")
            context.skip_remaining_steps = True
            return

        if isinstance(raw_price, str):
            clean_price_str = raw_price.replace("$", "").replace("€", "").replace("£", "").replace("TL", "").strip()

            dot_pos = clean_price_str.rfind('.')
            comma_pos = clean_price_str.rfind(',')

            # Nokta, virgülden sonra geliyorsa (Amerikan formatı: 1,234.56)
            if dot_pos > comma_pos:
                clean_price_str = clean_price_str.replace(',', '')
            # Virgül, noktadan sonra geliyorsa (Avrupa formatı: 1.234,56)
            elif comma_pos > dot_pos:
                clean_price_str = clean_price_str.replace('.', '')
                clean_price_str = clean_price_str.replace(',', '.')
            # Sadece virgül varsa, ondalık ayracı olduğunu varsay
            else:
                clean_price_str = clean_price_str.replace(',', '.')
        else:
            clean_price_str = str(raw_price)

        try:
            price_float = float(clean_price_str)
        except ValueError:
            context.errors.append(f"ID {external_id}: Fiyat '{raw_price}' parse edilemedi (Temizlenmiş: '{clean_price_str}').")
            context.skip_remaining_steps = True
            return

        try:
            price_in_try = await self.currency_service.convert_price(
                amount=price_float, currency=raw_currency
            )
        except Exception as e:
            context.errors.append(f"ID {external_id}: Döviz çevrimi sırasında hata: {e}")
            context.skip_remaining_steps = True
            return

        data["original_price"] = price_float
        data["original_currency"] = raw_currency
        data["price"] = round(price_in_try, 2)
        data["currency"] = "TRY"
        
        # Veriyi güncelle ve sonucu ayarla
        context.data = data
        context.result = data
