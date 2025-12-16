from fastapi import APIRouter

from app.domain.schemas.providers import (
    SportDirectResponse,
    OutdoorProResponse,
    DagSporYanit,
    AlpineGearCatalog,
)
from app.application.services.provider import (
    SportDirectService,
    OutdoorProService,
    DagSporService,
    AlpineGearService,
)

router = APIRouter(prefix="/providers", tags=["Mock Providers"])


# ============== SportDirect (UK/GBP - %1 Hata) ==============
@router.get("/sport-direct/products", response_model=SportDirectResponse)
async def get_sport_direct_products():
    """
    SportDirect - Tüm ürünleri getirir
    
    - **Currency**: GBP
    - **Error Rate**: ~1%
    - **Response Format**: Detaylı (tüm alanlar)
    """
    return await SportDirectService.get_all_products()


# ============== OutdoorPro (US/USD - %5 Hata) ==============
@router.get("/outdoor-pro/products", response_model=OutdoorProResponse)
async def get_outdoor_pro_products():
    """
    OutdoorPro - Tüm ürünleri getirir
    
    - **Currency**: USD
    - **Error Rate**: ~5%
    - **Response Format**: Orta detay
    """
    return await OutdoorProService.get_all_products()


# ============== DagSpor (TR/TRY - %15 Hata) ==============
@router.get("/dag-spor/products", response_model=DagSporYanit)
async def get_dag_spor_products():
    """
    DagSpor - Tüm ürünleri getirir
    
    - **Currency**: TRY
    - **Error Rate**: ~15%
    - **Response Format**: Türkçe field isimleri
    """
    return await DagSporService.get_all_products()


# ============== AlpineGear (EU/EUR - %30 Hata) ==============
@router.get("/alpine-gear/products", response_model=AlpineGearCatalog)
async def get_alpine_gear_products():
    """
    AlpineGear - Tüm ürünleri getirir
    
    - **Currency**: EUR
    - **Error Rate**: ~30%
    - **Response Format**: Minimal (sadece temel alanlar)
    """
    return await AlpineGearService.get_all_products()
