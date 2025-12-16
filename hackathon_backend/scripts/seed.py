import asyncio
import random
from decimal import Decimal

from faker import Faker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Proje ayarlarını ve modellerini import et
from app.core.config.settings import settings
from app.persistence.models import (
    Category,
    Currency,
    PriceHistory,
    PriceTier,
    Product,
    ProductMapping,
    ProductVariant,
    Provider,
)

# Veritabanı bağlantısı
engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

fake = Faker("tr_TR")


async def seed_data():
    """Veritabanını sahte verilerle doldurur."""
    async with AsyncSessionLocal() as session:
        print("Mevcut veriler temizleniyor...")
        await session.execute(PriceTier.__table__.delete())
        await session.execute(PriceHistory.__table__.delete())
        await session.execute(ProductMapping.__table__.delete())
        await session.execute(ProductVariant.__table__.delete())
        await session.execute(Product.__table__.delete())
        await session.execute(Category.__table__.delete())
        await session.execute(Provider.__table__.delete())
        await session.execute(Currency.__table__.delete())
        await session.commit()

        print("Yeni veriler ekleniyor...")

        # --- Para Birimleri ---
        currencies = [
            Currency(code="TRY", symbol="₺", name="Türk Lirası", exchange_rate=1.0),
            Currency(code="USD", symbol="$", name="ABD Doları", exchange_rate=32.50),
            Currency(code="EUR", symbol="€", name="Euro", exchange_rate=35.20),
        ]
        session.add_all(currencies)
        await session.flush()
        print(f"{len(currencies)} para birimi eklendi.")

        # --- Sağlayıcılar ---
        providers = []
        for _ in range(10):
            providers.append(
                Provider(
                    name=fake.company(),
                    slug=fake.slug(),
                    rating=Decimal(random.uniform(3.5, 5.0)),
                    review_count=random.randint(50, 5000),
                    is_verified=random.choice([True, False]),
                )
            )
        session.add_all(providers)
        await session.flush()
        print(f"{len(providers)} sağlayıcı eklendi.")

        # --- Kategoriler ---
        parent_categories = []
        for _ in range(5):
            parent_categories.append(
                Category(name=fake.word().capitalize(), slug=fake.slug())
            )
        session.add_all(parent_categories)
        await session.flush()

        child_categories = []
        for parent in parent_categories:
            for _ in range(random.randint(2, 5)):
                child_categories.append(
                    Category(
                        name=fake.word().capitalize(),
                        slug=fake.slug(),
                        parent_id=parent.id,
                    )
                )
        session.add_all(child_categories)
        await session.flush()
        all_categories = parent_categories + child_categories
        print(f"{len(all_categories)} kategori eklendi.")

        # --- Ürünler ---
        products = []
        for _ in range(50):
            products.append(
                Product(
                    category_id=random.choice(all_categories).id,
                    name=fake.catch_phrase(),
                    slug=fake.slug(),
                    brand=fake.company(),
                    description=fake.paragraph(nb_sentences=3),
                )
            )
        session.add_all(products)
        await session.flush()
        print(f"{len(products)} ürün eklendi.")

        # --- Ürün Varyantları ve Eşleşmeleri ---
        product_mappings = []
        price_histories = []
        for product in products:
            # Varyantlar
            for i in range(random.randint(1, 4)):
                variant = ProductVariant(
                    product_id=product.id,
                    sku=fake.ean(length=13),
                    attributes={
                        "color": fake.color_name(),
                        "size": random.choice(["S", "M", "L", "XL"]),
                    },
                )
                session.add(variant)
                await session.flush()

                # Eşleşme (Mapping)
                provider = random.choice(providers)
                mapping = ProductMapping(
                    product_id=product.id,
                    provider_id=provider.id,
                    external_product_code=fake.uuid4(),
                    product_url=fake.url(),
                )
                product_mappings.append(mapping)
                session.add(mapping)
                await session.flush()

                # Fiyat Geçmişi
                price = Decimal(random.uniform(50.0, 2000.0))
                history = PriceHistory(
                    mapping_id=mapping.id,
                    variant_id=variant.id,
                    price=price,
                    original_price=price * Decimal(random.uniform(1.1, 1.5)),
                    currency_id=random.choice(currencies).id,
                    in_stock=True,
                    stock_quantity=random.randint(10, 1000),
                )
                price_histories.append(history)

        session.add_all(price_histories)
        await session.flush()
        print(f"{len(product_mappings)} ürün eşleşmesi ve {len(price_histories)} fiyat geçmişi kaydı eklendi.")

        # --- Fiyat Kademeleri ---
        price_tiers = []
        for history in random.sample(price_histories, k=len(price_histories) // 3):
            for i in range(random.randint(1, 3)):
                price_tiers.append(
                    PriceTier(
                        price_history_id=history.id,
                        min_quantity=10 * (i + 1),
                        unit_price=history.price * Decimal(0.9 - i * 0.1),
                    )
                )
        session.add_all(price_tiers)
        await session.flush()
        print(f"{len(price_tiers)} fiyat kademesi eklendi.")

        # Değişiklikleri onayla
        await session.commit()
        print("\nVeritabanı başarıyla dolduruldu!")


async def main():
    # Gerekli kütüphaneleri kontrol et
    try:
        import faker
    except ImportError:
        print("Gerekli kütüphaneler eksik. Lütfen çalıştırın: pip install faker")
        return

    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
