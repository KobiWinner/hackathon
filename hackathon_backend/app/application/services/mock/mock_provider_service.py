"""
Mock Provider Services - Internal mock API implementations.
Replaces external mocker service with internal implementations.
Uses UnifiedProduct schema for standardized output.
"""
import random
import asyncio
from datetime import datetime
from typing import List

from app.domain.schemas.product import UnifiedProduct, Provider

# ============== MASTER PRODUCT CATALOG ==============
# All products available across providers

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

# Provider product access configuration
PROVIDER_CONFIGS = {
    Provider.SPORT_DIRECT: {
        "slug": "sport-direct",
        "currency": "GBP",
        "error_rate": 0.01,
        "skus": ["RUN-001", "RUN-002", "RUN-003", "RUN-004", "RUN-005", "RUN-006",
                 "BIKE-001", "BIKE-002", "BIKE-003", "BIKE-004", "BIKE-005",
                 "FIT-001", "FIT-002", "FIT-003", "FIT-004",
                 "CAMP-001", "CAMP-003", "CAMP-007"],
        "price_modifier": 1.0,
        "stock_modifier": 1.2,
    },
    Provider.OUTDOOR_PRO: {
        "slug": "outdoor-pro",
        "currency": "USD",
        "error_rate": 0.05,
        "skus": ["CAMP-001", "CAMP-002", "CAMP-003", "CAMP-004", "CAMP-005", "CAMP-006", "CAMP-007", "CAMP-008",
                 "CLIMB-001", "CLIMB-002", "CLIMB-003", "CLIMB-004", "CLIMB-005", "CLIMB-006", "CLIMB-007",
                 "WATER-001", "WATER-002", "WATER-003", "WATER-004",
                 "RUN-004", "RUN-005"],
        "price_modifier": 1.05,
        "stock_modifier": 1.0,
    },
    Provider.DAG_SPOR: {
        "slug": "dag-spor",
        "currency": "TRY",
        "error_rate": 0.15,
        "skus": ["CLIMB-001", "CLIMB-002", "CLIMB-003", "CLIMB-004", "CLIMB-005", "CLIMB-006", "CLIMB-007",
                 "CAMP-001", "CAMP-002", "CAMP-003", "CAMP-004", "CAMP-005", "CAMP-006", "CAMP-007", "CAMP-008",
                 "SKI-001", "SKI-002", "SKI-003", "SKI-004", "SKI-005"],
        "price_modifier": 0.85,
        "stock_modifier": 0.7,
    },
    Provider.ALPINE_GEAR: {
        "slug": "alpine-gear",
        "currency": "EUR",
        "error_rate": 0.30,
        "skus": ["SKI-001", "SKI-002", "SKI-003", "SKI-004", "SKI-005",
                 "CLIMB-001", "CLIMB-003", "CLIMB-006", "CLIMB-007",
                 "CAMP-002", "CAMP-004"],
        "price_modifier": 1.15,
        "stock_modifier": 0.5,
    },
}


class ProductGenerator:
    """Generate mock products for providers."""
    
    _cache: dict = {}
    
    @classmethod
    def get_master_product(cls, sku: str) -> dict | None:
        """Get a master product by SKU."""
        for p in MASTER_PRODUCTS:
            if p["sku"] == sku:
                return p.copy()
        return None
    
    @classmethod
    def generate_price(cls, base_price: float, currency: str, modifier: float = 1.0) -> float:
        """Generate a price with currency conversion and variation."""
        rate = EXCHANGE_RATES.get(currency, 1.0)
        variation = random.uniform(0.97, 1.03)  # ±3% price variation
        price = base_price * rate * modifier * variation
        endings = [0.99, 0.95, 0.00]
        return round(int(price) + random.choice(endings), 2)
    
    @classmethod
    def generate_stock(cls, modifier: float = 1.0) -> int:
        """Generate random stock quantity."""
        base = random.randint(5, 100)
        return max(0, int(base * modifier))


class MockProviderService:
    """
    Internal mock provider service.
    Replaces external mocker API calls with direct function calls.
    Returns standardized UnifiedProduct format.
    """
    
    @staticmethod
    async def _add_latency(min_s: float = 0.1, max_s: float = 0.5) -> None:
        """Simulate network latency."""
        await asyncio.sleep(random.uniform(min_s, max_s))
    
    @classmethod
    async def _get_products_for_provider(cls, provider: Provider) -> List[UnifiedProduct]:
        """Generate products for a specific provider."""
        config = PROVIDER_CONFIGS[provider]
        collected_at = datetime.utcnow()
        
        # Simulate latency
        await cls._add_latency()
        
        # Set seed for consistent randomness per provider
        random.seed(hash(provider.value))
        
        products = []
        for idx, sku in enumerate(config["skus"], 1):
            master = ProductGenerator.get_master_product(sku)
            if not master:
                continue
            
            stock = ProductGenerator.generate_stock(config["stock_modifier"])
            price = ProductGenerator.generate_price(
                master["base_price"], 
                config["currency"], 
                config["price_modifier"]
            )
            
            products.append(UnifiedProduct(
                provider=provider,
                provider_product_id=str(idx),
                name=master["name"],
                description=f"{master['brand']} - {master['category']}",
                price=price,
                currency=config["currency"],
                stock=stock,
                collected_at=collected_at
            ))
        
        # Reset random seed
        random.seed()
        
        return products
    
    @classmethod
    async def get_sport_direct_products(cls) -> List[UnifiedProduct]:
        """SportDirect - UK/GBP - 1% error rate."""
        return await cls._get_products_for_provider(Provider.SPORT_DIRECT)
    
    @classmethod
    async def get_outdoor_pro_products(cls) -> List[UnifiedProduct]:
        """OutdoorPro - US/USD - 5% error rate."""
        return await cls._get_products_for_provider(Provider.OUTDOOR_PRO)
    
    @classmethod
    async def get_dag_spor_products(cls) -> List[UnifiedProduct]:
        """DagSpor - TR/TRY - 15% error rate."""
        return await cls._get_products_for_provider(Provider.DAG_SPOR)
    
    @classmethod
    async def get_alpine_gear_products(cls) -> List[UnifiedProduct]:
        """AlpineGear - EU/EUR - 30% error rate."""
        return await cls._get_products_for_provider(Provider.ALPINE_GEAR)
    
    @classmethod
    async def get_all_products(cls) -> List[UnifiedProduct]:
        """Get products from all providers."""
        results = await asyncio.gather(
            cls.get_sport_direct_products(),
            cls.get_outdoor_pro_products(),
            cls.get_dag_spor_products(),
            cls.get_alpine_gear_products(),
            return_exceptions=True
        )
        
        all_products = []
        for result in results:
            if isinstance(result, list):
                all_products.extend(result)
        
        return all_products
