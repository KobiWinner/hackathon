"""
Tüm Provider Servisleri - Mock API'ler için iş mantığı
Aynı ürünler farklı provider'larda farklı fiyatlarla bulunabilir.
"""
import random
import asyncio
from datetime import datetime
from faker import Faker
from fastapi import HTTPException

fake_en = Faker('en_US')
Faker.seed(42)

# ============== MASTER PRODUCT CATALOG ==============
# Tüm provider'ların erişebildiği ana ürün havuzu

BRANDS = {
    "Kamp": ["NorthFace", "MSR", "Deuter", "Mammut", "Coleman", "Black Diamond", "Osprey"],
    "Dağcılık": ["La Sportiva", "Salomon", "Petzl", "Black Diamond", "Mammut", "Arc'teryx"],
    "Koşu": ["Nike", "Adidas", "Hoka", "Asics", "Brooks", "Salomon", "Garmin"],
    "Bisiklet": ["Specialized", "Trek", "Giant", "Shimano", "SRAM", "Giro", "Wahoo"],
    "Su Sporları": ["O'Neill", "Billabong", "Rip Curl", "Red Paddle", "NRS", "Cressi"],
    "Kış Sporları": ["Atomic", "Rossignol", "Burton", "Salomon", "K2", "Arc'teryx"],
    "Fitness": ["Nike", "Under Armour", "Reebok", "TRX", "Rogue", "Hyperice"],
}

MASTER_PRODUCTS = [
    # Kamp
    {"sku": "CAMP-001", "name": "NorthFace Stormbreak 2 Çadır", "brand": "NorthFace", "category": "Kamp", "subcategory": "Çadır", "base_price": 250, "weight": 2.5},
    {"sku": "CAMP-002", "name": "MSR Hubba Hubba NX 2 Çadır", "brand": "MSR", "category": "Kamp", "subcategory": "Çadır", "base_price": 450, "weight": 1.7},
    {"sku": "CAMP-003", "name": "Deuter Astro 500 Uyku Tulumu", "brand": "Deuter", "category": "Kamp", "subcategory": "Uyku Tulumu", "base_price": 180, "weight": 1.2},
    {"sku": "CAMP-004", "name": "Mammut Perform Down -15°C", "brand": "Mammut", "category": "Kamp", "subcategory": "Uyku Tulumu", "base_price": 320, "weight": 0.9},
    {"sku": "CAMP-005", "name": "Therm-a-Rest NeoAir XLite Mat", "brand": "Therm-a-Rest", "category": "Kamp", "subcategory": "Mat", "base_price": 200, "weight": 0.35},
    {"sku": "CAMP-006", "name": "Jetboil Flash Ocak Sistemi", "brand": "Jetboil", "category": "Kamp", "subcategory": "Pişirme", "base_price": 120, "weight": 0.4},
    {"sku": "CAMP-007", "name": "Black Diamond Spot 400 Kafa Lambası", "brand": "Black Diamond", "category": "Kamp", "subcategory": "Aydınlatma", "base_price": 45, "weight": 0.09},
    {"sku": "CAMP-008", "name": "Osprey Atmos AG 65 Sırt Çantası", "brand": "Osprey", "category": "Kamp", "subcategory": "Çanta", "base_price": 280, "weight": 2.1},
    
    # Dağcılık
    {"sku": "CLIMB-001", "name": "La Sportiva Nepal Cube GTX", "brand": "La Sportiva", "category": "Dağcılık", "subcategory": "Ayakkabı", "base_price": 550, "weight": 1.1},
    {"sku": "CLIMB-002", "name": "Salomon X Ultra 4 GTX", "brand": "Salomon", "category": "Dağcılık", "subcategory": "Ayakkabı", "base_price": 180, "weight": 0.8},
    {"sku": "CLIMB-003", "name": "Petzl Sirocco Kask", "brand": "Petzl", "category": "Dağcılık", "subcategory": "Güvenlik", "base_price": 120, "weight": 0.17},
    {"sku": "CLIMB-004", "name": "Black Diamond Trail Pro Baton", "brand": "Black Diamond", "category": "Dağcılık", "subcategory": "Baton", "base_price": 150, "weight": 0.5},
    {"sku": "CLIMB-005", "name": "Mammut 9.5 Crag Classic İp 70m", "brand": "Mammut", "category": "Dağcılık", "subcategory": "İp", "base_price": 180, "weight": 4.2},
    {"sku": "CLIMB-006", "name": "Arc'teryx Alpha SV Ceket", "brand": "Arc'teryx", "category": "Dağcılık", "subcategory": "Giyim", "base_price": 800, "weight": 0.49},
    {"sku": "CLIMB-007", "name": "Petzl Lynx Krampon", "brand": "Petzl", "category": "Dağcılık", "subcategory": "Buz/Kar", "base_price": 220, "weight": 1.1},
    
    # Koşu
    {"sku": "RUN-001", "name": "Nike Pegasus 40", "brand": "Nike", "category": "Koşu", "subcategory": "Ayakkabı", "base_price": 130, "weight": 0.28},
    {"sku": "RUN-002", "name": "Hoka Clifton 9", "brand": "Hoka", "category": "Koşu", "subcategory": "Ayakkabı", "base_price": 145, "weight": 0.25},
    {"sku": "RUN-003", "name": "Asics Gel-Kayano 30", "brand": "Asics", "category": "Koşu", "subcategory": "Ayakkabı", "base_price": 180, "weight": 0.31},
    {"sku": "RUN-004", "name": "Garmin Forerunner 265", "brand": "Garmin", "category": "Koşu", "subcategory": "Elektronik", "base_price": 450, "weight": 0.047},
    {"sku": "RUN-005", "name": "Salomon ADV Skin 12 Vest", "brand": "Salomon", "category": "Koşu", "subcategory": "Çanta", "base_price": 150, "weight": 0.22},
    {"sku": "RUN-006", "name": "Brooks Ghost 15", "brand": "Brooks", "category": "Koşu", "subcategory": "Ayakkabı", "base_price": 140, "weight": 0.29},
    
    # Bisiklet
    {"sku": "BIKE-001", "name": "Specialized Tarmac SL7 Kadro", "brand": "Specialized", "category": "Bisiklet", "subcategory": "Kadro", "base_price": 3500, "weight": 0.86},
    {"sku": "BIKE-002", "name": "Shimano Ultegra R8100 Groupset", "brand": "Shimano", "category": "Bisiklet", "subcategory": "Parça", "base_price": 1800, "weight": 2.7},
    {"sku": "BIKE-003", "name": "Giro Aether MIPS Kask", "brand": "Giro", "category": "Bisiklet", "subcategory": "Güvenlik", "base_price": 300, "weight": 0.26},
    {"sku": "BIKE-004", "name": "Wahoo ELEMNT BOLT V2", "brand": "Wahoo", "category": "Bisiklet", "subcategory": "Elektronik", "base_price": 280, "weight": 0.069},
    {"sku": "BIKE-005", "name": "SRAM Red AXS Vites Grubu", "brand": "SRAM", "category": "Bisiklet", "subcategory": "Parça", "base_price": 2800, "weight": 2.4},
    
    # Kış Sporları
    {"sku": "SKI-001", "name": "Atomic Redster G9 Kayak", "brand": "Atomic", "category": "Kış Sporları", "subcategory": "Kayak", "base_price": 700, "weight": 3.8},
    {"sku": "SKI-002", "name": "Rossignol Hero Elite ST Ti", "brand": "Rossignol", "category": "Kış Sporları", "subcategory": "Kayak", "base_price": 650, "weight": 3.6},
    {"sku": "SKI-003", "name": "Burton Custom X Snowboard", "brand": "Burton", "category": "Kış Sporları", "subcategory": "Snowboard", "base_price": 700, "weight": 2.8},
    {"sku": "SKI-004", "name": "Salomon S/Pro 130 Kayak Botu", "brand": "Salomon", "category": "Kış Sporları", "subcategory": "Ayakkabı", "base_price": 450, "weight": 1.9},
    {"sku": "SKI-005", "name": "Arc'teryx Rush Ceket", "brand": "Arc'teryx", "category": "Kış Sporları", "subcategory": "Giyim", "base_price": 750, "weight": 0.55},
    
    # Su Sporları
    {"sku": "WATER-001", "name": "O'Neill Psycho Tech 4/3mm Wetsuit", "brand": "O'Neill", "category": "Su Sporları", "subcategory": "Giyim", "base_price": 350, "weight": 2.1},
    {"sku": "WATER-002", "name": "Red Paddle Sport 11'3 SUP", "brand": "Red Paddle", "category": "Su Sporları", "subcategory": "Board", "base_price": 900, "weight": 8.5},
    {"sku": "WATER-003", "name": "NRS Chinook PFD Can Yeleği", "brand": "NRS", "category": "Su Sporları", "subcategory": "Güvenlik", "base_price": 120, "weight": 0.7},
    {"sku": "WATER-004", "name": "Cressi F1 Dalış Maskesi", "brand": "Cressi", "category": "Su Sporları", "subcategory": "Dalış", "base_price": 80, "weight": 0.15},
    
    # Fitness
    {"sku": "FIT-001", "name": "Rogue Ohio Bar", "brand": "Rogue", "category": "Fitness", "subcategory": "Ekipman", "base_price": 300, "weight": 20.0},
    {"sku": "FIT-002", "name": "TRX Pro4 Suspension Trainer", "brand": "TRX", "category": "Fitness", "subcategory": "Ekipman", "base_price": 200, "weight": 0.9},
    {"sku": "FIT-003", "name": "Hyperice Hypervolt 2 Pro", "brand": "Hyperice", "category": "Fitness", "subcategory": "Recovery", "base_price": 350, "weight": 1.1},
    {"sku": "FIT-004", "name": "Nike Metcon 9", "brand": "Nike", "category": "Fitness", "subcategory": "Ayakkabı", "base_price": 150, "weight": 0.35},
]

COLORS = ["Siyah", "Beyaz", "Mavi", "Kırmızı", "Yeşil", "Turuncu", "Gri", "Lacivert"]
EXCHANGE_RATES = {"GBP": 1.0, "USD": 1.27, "EUR": 1.17, "TRY": 40.50}

# Her provider hangi ürünlere erişebilir (SKU listesi)
PROVIDER_PRODUCT_ACCESS = {
    "SportDirect": {
        "skus": ["RUN-001", "RUN-002", "RUN-003", "RUN-004", "RUN-005", "RUN-006",
                 "BIKE-001", "BIKE-002", "BIKE-003", "BIKE-004", "BIKE-005",
                 "FIT-001", "FIT-002", "FIT-003", "FIT-004",
                 "CAMP-001", "CAMP-003", "CAMP-007"],  # Bazı kamp ürünleri de var
        "price_modifier": 1.0,
        "stock_modifier": 1.2,  # Daha fazla stok
    },
    "OutdoorPro": {
        "skus": ["CAMP-001", "CAMP-002", "CAMP-003", "CAMP-004", "CAMP-005", "CAMP-006", "CAMP-007", "CAMP-008",
                 "CLIMB-001", "CLIMB-002", "CLIMB-003", "CLIMB-004", "CLIMB-005", "CLIMB-006", "CLIMB-007",
                 "WATER-001", "WATER-002", "WATER-003", "WATER-004",
                 "RUN-004", "RUN-005"],  # Bazı koşu ürünleri de var
        "price_modifier": 1.05,
        "stock_modifier": 1.0,
    },
    "DagSpor": {
        "skus": ["CLIMB-001", "CLIMB-002", "CLIMB-003", "CLIMB-004", "CLIMB-005", "CLIMB-006", "CLIMB-007",
                 "CAMP-001", "CAMP-002", "CAMP-003", "CAMP-004", "CAMP-005", "CAMP-006", "CAMP-007", "CAMP-008",
                 "SKI-001", "SKI-002", "SKI-003", "SKI-004", "SKI-005"],
        "price_modifier": 0.85,  # TL ucuz
        "stock_modifier": 0.7,   # Daha az stok
    },
    "AlpineGear": {
        "skus": ["SKI-001", "SKI-002", "SKI-003", "SKI-004", "SKI-005",
                 "CLIMB-001", "CLIMB-003", "CLIMB-006", "CLIMB-007",
                 "CAMP-002", "CAMP-004"],  # Premium ürünler
        "price_modifier": 1.15,  # Premium fiyat
        "stock_modifier": 0.5,   # Az stok (nadir)
    },
}


class ProductGenerator:
    """Provider'a özgü ürün üretici - Ortak ürün havuzundan"""
    
    _cache: dict = {}
    
    @classmethod
    def get_master_product(cls, sku: str) -> dict | None:
        for p in MASTER_PRODUCTS:
            if p["sku"] == sku:
                return p.copy()
        return None
    
    @classmethod
    def generate_price(cls, base_price: float, currency: str, modifier: float = 1.0) -> float:
        rate = EXCHANGE_RATES.get(currency, 1.0)
        variation = random.uniform(0.97, 1.03)  # ±%3 fiyat değişimi
        price = base_price * rate * modifier * variation
        endings = [0.99, 0.95, 0.00]
        return round(int(price) + random.choice(endings), 2)
    
    @classmethod
    def generate_stock(cls, modifier: float = 1.0) -> int:
        base = random.randint(5, 100)
        return max(0, int(base * modifier))
    
    @classmethod
    def get_products_for_provider(cls, provider_name: str) -> list[dict]:
        cache_key = f"{provider_name}_products"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        config = PROVIDER_PRODUCT_ACCESS[provider_name]
        products = []
        
        random.seed(hash(provider_name))  # Provider'a özgü tutarlı randomness
        
        for idx, sku in enumerate(config["skus"], 1):
            master = cls.get_master_product(sku)
            if master:
                products.append({
                    "id": idx,
                    "sku": sku,
                    "name": master["name"],
                    "brand": master["brand"],
                    "category": master["category"],
                    "subcategory": master["subcategory"],
                    "color": random.choice(COLORS),
                    "weight_kg": master["weight"],
                    "base_price": master["base_price"],
                    "price_modifier": config["price_modifier"],
                    "stock_modifier": config["stock_modifier"],
                })
        
        random.seed()
        cls._cache[cache_key] = products
        return products


# ============== ERROR SIMULATION ==============

def _simulate_error(error_rate: float, provider_name: str) -> None:
    if random.random() < error_rate:
        if random.random() < 0.7:
            raise HTTPException(status_code=429, detail={"error": "rate_limit_exceeded", "message": f"{provider_name} API rate limit exceeded", "retry_after": random.randint(30, 120)})
        raise HTTPException(status_code=500, detail={"error": "internal_error", "message": f"{provider_name} API error"})


async def _add_latency(min_s: float = 0.1, max_s: float = 0.5) -> None:
    await asyncio.sleep(random.uniform(min_s, max_s))


# ============== PROVIDER SERVICES ==============

class SportDirectService:
    """UK (GBP) - %1 hata - Koşu, Fitness, Bisiklet odaklı"""
    ERROR_RATE, CURRENCY, PROVIDER_NAME = 0.01, "GBP", "SportDirect"

    @classmethod
    async def get_all_products(cls):
        from app.domain.schemas.providers import SportDirectProduct, SportDirectResponse
        _simulate_error(cls.ERROR_RATE, cls.PROVIDER_NAME)
        await _add_latency()
        
        products = []
        for p in ProductGenerator.get_products_for_provider(cls.PROVIDER_NAME):
            stock = ProductGenerator.generate_stock(p["stock_modifier"])
            products.append(SportDirectProduct(
                product_id=p["id"],
                product_name=p["name"],
                brand=p["brand"],
                category=p["category"],
                subcategory=p["subcategory"],
                colour=p["color"],
                weight_kg=p["weight_kg"],
                price_gbp=ProductGenerator.generate_price(p["base_price"], cls.CURRENCY, p["price_modifier"]),
                stock_quantity=stock,
                in_stock=stock > 0,
                last_updated=datetime.utcnow().isoformat()
            ))
        return SportDirectResponse(provider=cls.PROVIDER_NAME, currency=cls.CURRENCY, total_products=len(products), timestamp=datetime.utcnow().isoformat(), products=products)


class OutdoorProService:
    """US (USD) - %5 hata - Kamp, Dağcılık, Su Sporları odaklı"""
    ERROR_RATE, CURRENCY, PROVIDER_NAME = 0.05, "USD", "OutdoorPro"

    @classmethod
    async def get_all_products(cls):
        from app.domain.schemas.providers import OutdoorProItem, OutdoorProResponse
        _simulate_error(cls.ERROR_RATE, cls.PROVIDER_NAME)
        await _add_latency()
        
        items = []
        for p in ProductGenerator.get_products_for_provider(cls.PROVIDER_NAME):
            stock = ProductGenerator.generate_stock(p["stock_modifier"])
            items.append(OutdoorProItem(
                id=p["id"],
                name=p["name"],
                brand=p["brand"],
                category=p["category"],
                price=ProductGenerator.generate_price(p["base_price"], cls.CURRENCY, p["price_modifier"]),
                currency=cls.CURRENCY,
                stock=stock,
                available=stock > 0
            ))
        return OutdoorProResponse(source=cls.PROVIDER_NAME, fetched_at=datetime.utcnow().isoformat(), count=len(items), items=items)


class DagSporService:
    """TR (TRY) - %15 hata - Dağcılık, Kamp, Kış Sporları odaklı"""
    ERROR_RATE, CURRENCY, PROVIDER_NAME = 0.15, "TRY", "DagSpor"

    @classmethod
    async def get_all_products(cls):
        from app.domain.schemas.providers import DagSporUrun, DagSporYanit
        _simulate_error(cls.ERROR_RATE, cls.PROVIDER_NAME)
        await _add_latency()
        
        urunler = []
        for p in ProductGenerator.get_products_for_provider(cls.PROVIDER_NAME):
            stok = ProductGenerator.generate_stock(p["stock_modifier"])
            urunler.append(DagSporUrun(
                urun_id=p["id"],
                urun_adi=p["name"],
                marka=p["brand"],
                kategori=p["category"],
                alt_kategori=p["subcategory"],
                renk=p["color"],
                fiyat=ProductGenerator.generate_price(p["base_price"], cls.CURRENCY, p["price_modifier"]),
                para_birimi=cls.CURRENCY,
                stok_adedi=stok,
                stokta_var=stok > 0,
                son_guncelleme=datetime.utcnow().isoformat()
            ))
        return DagSporYanit(tedarikci=cls.PROVIDER_NAME, toplam_urun=len(urunler), tarih=datetime.utcnow().isoformat(), urunler=urunler)


class AlpineGearService:
    """EU (EUR) - %30 hata - Kış Sporları, Premium Dağcılık odaklı"""
    ERROR_RATE, CURRENCY, PROVIDER_NAME = 0.30, "EUR", "AlpineGear"

    @classmethod
    async def get_all_products(cls):
        from app.domain.schemas.providers import AlpineGearProduct, AlpineGearCatalog
        _simulate_error(cls.ERROR_RATE, cls.PROVIDER_NAME)
        await asyncio.sleep(random.uniform(0.3, 1.0))
        
        catalog = []
        for p in ProductGenerator.get_products_for_provider(cls.PROVIDER_NAME):
            qty = ProductGenerator.generate_stock(p["stock_modifier"])
            catalog.append(AlpineGearProduct(
                sku=p["id"],
                title=p["name"],
                manufacturer=p["brand"],
                price_eur=ProductGenerator.generate_price(p["base_price"], cls.CURRENCY, p["price_modifier"]),
                qty=qty
            ))
        return AlpineGearCatalog(vendor=cls.PROVIDER_NAME, catalog_date=datetime.utcnow().strftime("%Y-%m-%d"), product_count=len(catalog), catalog=catalog)
