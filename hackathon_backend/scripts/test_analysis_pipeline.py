import asyncio
from unittest.mock import MagicMock

from app.application.cqrs.commands.analytics.product_analysis_command import ProductAnalysisCommandService
from app.application.services.price.currency_service import CurrencyService


async def main():
    print("--- Ürün Analiz Pipeline Testi Başlıyor ---\n")

    # 1. Bağımlılıkları Hazırla
    # Gerçek CurrencyService kullanıyoruz (Fallback değerleri veya API ile çalışır)
    currency_service = CurrencyService()

    # UnitOfWork'ü Mockluyoruz (Taklit ediyoruz)
    # Şu anki adımımız (NormalizeCurrencyStep) veritabanı kullanmadığı için
    # gerçek bir DB bağlantısına ihtiyacımız yok.
    mock_uow = MagicMock()
    # Async context manager (__aenter__ ve __aexit__) metodlarını tanımlıyoruz
    # Çünkü command servisinde 'async with self.uow:' kullanılıyor.
    mock_uow.__aenter__.return_value = mock_uow
    mock_uow.__aexit__.return_value = None

    # 2. Command Servisini Başlat
    command_service = ProductAnalysisCommandService(mock_uow, currency_service)

    # 3. Test Senaryoları
    test_cases = [
        {
            "id": "TEST-001",
            "name": "Laptop",
            "price": "$1,200.00",
            "currency": "USD",
            "description": "Normal USD formatı"
        },
        {
            "id": "TEST-002",
            "name": "Telefon",
            "price": "1.500,50",
            "currency": "EUR",
            "description": "Avrupa formatı (Nokta binlik, virgül ondalık)"
        },
        {
            "id": "TEST-003",
            "name": "Mouse",
            "price": "500",
            "currency": "TRY",
            "description": "Zaten TRY olan ve temiz veri"
        },
        {
            "id": "TEST-004",
            "name": "Hatalı Ürün",
            "price": "Fiyat Yok",
            "currency": "USD",
            "description": "Parse edilemeyen fiyat"
        },
        {
            "id": "TEST-005",
            "name": "Eksik Veri",
            "currency": "USD",
            "description": "Price alanı hiç yok"
        }
    ]

    # 4. Testleri Çalıştır
    for data in test_cases:
        print(f"GİRDİ: {data['description']}")
        print(f"Veri : Price='{data.get('price')}', Currency='{data.get('currency')}'")
        
        result = await command_service.analyze_product(data.copy())
        
        if result:
            print("SONUÇ: BAŞARILI ✅")
            print(f"Normalize Fiyat: {result['price']} {result['currency']}")
            print(f"Orijinal Veri  : {result['original_price']} {result['original_currency']}")
        else:
            print("SONUÇ: BAŞARISIZ / ATLANDI ❌")
            # Gerçek uygulamada hataları loglardan görürüz, burada None dönüyor.
        
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
