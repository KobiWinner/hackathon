from pydantic import BaseModel


# ============== SportDirect (UK/GBP) ==============
class SportDirectProduct(BaseModel):
    product_id: int
    product_name: str
    brand: str
    category: str
    subcategory: str
    colour: str
    weight_kg: float
    price_gbp: float
    stock_quantity: int
    in_stock: bool
    last_updated: str


class SportDirectResponse(BaseModel):
    provider: str
    currency: str
    total_products: int
    timestamp: str
    products: list[SportDirectProduct]


# ============== OutdoorPro (US/USD) ==============
class OutdoorProItem(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    price: float
    currency: str
    stock: int
    available: bool


class OutdoorProResponse(BaseModel):
    source: str
    fetched_at: str
    count: int
    items: list[OutdoorProItem]


# ============== DagSpor (TR/TRY) ==============
class DagSporUrun(BaseModel):
    urun_id: int
    urun_adi: str
    marka: str
    kategori: str
    alt_kategori: str
    renk: str
    fiyat: float
    para_birimi: str
    stok_adedi: int
    stokta_var: bool
    son_guncelleme: str


class DagSporYanit(BaseModel):
    tedarikci: str
    toplam_urun: int
    tarih: str
    urunler: list[DagSporUrun]


# ============== AlpineGear (EU/EUR) ==============
class AlpineGearProduct(BaseModel):
    sku: int
    title: str
    manufacturer: str
    price_eur: float
    qty: int


class AlpineGearCatalog(BaseModel):
    vendor: str
    catalog_date: str
    product_count: int
    catalog: list[AlpineGearProduct]
