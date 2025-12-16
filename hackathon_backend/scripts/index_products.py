"""
Product Indexer Script.
PostgreSQL'deki ürünleri Elasticsearch'e indexler.

Kullanım: PYTHONPATH=. uv run python scripts/index_products.py
"""

import asyncio
from decimal import Decimal
from typing import Any, Dict, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, selectinload

from app.core.config.settings import settings
from app.core.infrastructure.elasticsearch import get_search_service
from app.application.services.product_search_service import (
    PRODUCTS_INDEX,
    PRODUCTS_MAPPING,
)
from app.persistence.models import (
    Category,
    Currency,
    PriceHistory,
    Product,
    ProductMapping,
    ProductVariant,
)


# Veritabanı bağlantısı
engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)


async def get_product_with_details(
    session: AsyncSession, product: Product
) -> Dict[str, Any]:
    """
    Ürün bilgilerini varyantları ve en düşük fiyatıyla birlikte getirir.
    Denormalize edilmiş ES dokümanı döner.
    """
    # Varyantları çek
    variants_result = await session.execute(
        select(ProductVariant).where(ProductVariant.product_id == product.id)
    )
    variants = variants_result.scalars().all()

    # Varyant attribute'larını topla
    colors: List[str] = []
    sizes: List[str] = []
    materials: List[str] = []
    all_attributes: List[str] = []

    for variant in variants:
        attrs = variant.attributes or {}
        if "color" in attrs:
            colors.append(str(attrs["color"]))
            all_attributes.append(str(attrs["color"]))
        if "size" in attrs:
            sizes.append(str(attrs["size"]))
            all_attributes.append(str(attrs["size"]))
        if "material" in attrs:
            materials.append(str(attrs["material"]))
            all_attributes.append(str(attrs["material"]))
        # Diğer attribute'ları da ekle
        for key, value in attrs.items():
            if key not in ("color", "size", "material"):
                all_attributes.append(str(value))

    # En düşük fiyatı bul (stokta olan)
    price_query = (
        select(
            func.min(PriceHistory.price).label("lowest_price"),
            func.max(PriceHistory.original_price).label("original_price"),
        )
        .join(ProductMapping, PriceHistory.mapping_id == ProductMapping.id)
        .where(
            ProductMapping.product_id == product.id,
            PriceHistory.in_stock == True,  # noqa: E712
        )
    )
    price_result = await session.execute(price_query)
    price_row = price_result.first()

    lowest_price = None
    original_price = None
    if price_row and price_row.lowest_price:
        lowest_price = float(price_row.lowest_price)
        if price_row.original_price:
            original_price = float(price_row.original_price)

    # Stok durumu
    stock_query = (
        select(func.bool_or(PriceHistory.in_stock))
        .join(ProductMapping, PriceHistory.mapping_id == ProductMapping.id)
        .where(ProductMapping.product_id == product.id)
    )
    stock_result = await session.execute(stock_query)
    in_stock = stock_result.scalar() or False

    # Kategori adı
    category_name = None
    if product.category_id:
        cat_result = await session.execute(
            select(Category.name).where(Category.id == product.category_id)
        )
        category_name = cat_result.scalar()

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "brand": product.brand,
        "category_id": product.category_id,
        "category_name": category_name,
        "gender": product.gender,
        "description": product.description,
        "image_url": product.image_url,
        "lowest_price": lowest_price,
        "original_price": original_price,
        "currency_code": "TRY",
        "in_stock": in_stock,
        "colors": list(set(colors)),
        "sizes": list(set(sizes)),
        "materials": list(set(materials)),
        "variant_attributes": " ".join(set(all_attributes)),
    }


async def index_all_products() -> int:
    """Tüm ürünleri Elasticsearch'e indexler."""
    search = get_search_service()

    # ES bağlantısını test et
    print("Elasticsearch bağlantısı kontrol ediliyor...")
    if not await search.health_check():
        print("❌ Elasticsearch bağlantısı kurulamadı!")
        return 0

    # Index'i oluştur (yoksa)
    print(f"Index '{PRODUCTS_INDEX}' oluşturuluyor...")
    await search.create_index(PRODUCTS_INDEX, mappings=PRODUCTS_MAPPING)

    # Ürünleri çek ve indexle
    async with AsyncSessionLocal() as session:
        # Tüm ürünleri çek
        result = await session.execute(select(Product))
        products = result.scalars().all()

        print(f"{len(products)} ürün bulundu, indexleniyor...")

        # Her ürün için ES dokümanı hazırla
        documents: List[Dict[str, Any]] = []
        for product in products:
            doc = await get_product_with_details(session, product)
            documents.append(doc)

        # Toplu indexle
        if documents:
            indexed = await search.bulk_index(PRODUCTS_INDEX, documents)
            print(f"✅ {indexed} ürün başarıyla indexlendi!")

            # Index'i refresh et (aramalar için güncel hale getir)
            await search.refresh_index(PRODUCTS_INDEX)
            return indexed

    return 0


async def main() -> None:
    """Ana fonksiyon."""
    print("=" * 50)
    print("Product Indexer - PostgreSQL → Elasticsearch")
    print("=" * 50)

    try:
        count = await index_all_products()
        if count > 0:
            print(f"\n✅ Toplam {count} ürün Elasticsearch'e indexlendi!")
        else:
            print("\n⚠️ Hiçbir ürün indexlenemedi.")
    except Exception as e:
        print(f"\n❌ Hata: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
