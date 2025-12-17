"""
Mock Provider Endpoints.
Internal mock API endpoints that replace external mocker service.
"""
from fastapi import APIRouter

from app.domain.schemas.mock import MockProviderResponse
from app.application.services.mock.mock_provider_service import (
    MockProviderService,
    PROVIDER_CONFIGS,
)
from app.domain.schemas.product import Provider

router = APIRouter(prefix="/mock", tags=["Mock Providers"])


@router.get("/sport-direct/products", response_model=MockProviderResponse)
async def get_sport_direct_products() -> MockProviderResponse:
    """
    SportDirect - UK/GBP provider.
    
    - **Currency**: GBP
    - **Focus**: Running, Fitness, Cycling
    - **Error Rate**: ~1% (simulated in production)
    """
    config = PROVIDER_CONFIGS[Provider.SPORT_DIRECT]
    products = await MockProviderService.get_sport_direct_products()
    return MockProviderResponse.create(
        provider=config["slug"],
        currency=config["currency"],
        products=products
    )


@router.get("/outdoor-pro/products", response_model=MockProviderResponse)
async def get_outdoor_pro_products() -> MockProviderResponse:
    """
    OutdoorPro - US/USD provider.
    
    - **Currency**: USD
    - **Focus**: Camping, Climbing, Water Sports
    - **Error Rate**: ~5% (simulated in production)
    """
    config = PROVIDER_CONFIGS[Provider.OUTDOOR_PRO]
    products = await MockProviderService.get_outdoor_pro_products()
    return MockProviderResponse.create(
        provider=config["slug"],
        currency=config["currency"],
        products=products
    )


@router.get("/dag-spor/products", response_model=MockProviderResponse)
async def get_dag_spor_products() -> MockProviderResponse:
    """
    DagSpor - TR/TRY provider.
    
    - **Currency**: TRY
    - **Focus**: Climbing, Camping, Winter Sports
    - **Error Rate**: ~15% (simulated in production)
    """
    config = PROVIDER_CONFIGS[Provider.DAG_SPOR]
    products = await MockProviderService.get_dag_spor_products()
    return MockProviderResponse.create(
        provider=config["slug"],
        currency=config["currency"],
        products=products
    )


@router.get("/alpine-gear/products", response_model=MockProviderResponse)
async def get_alpine_gear_products() -> MockProviderResponse:
    """
    AlpineGear - EU/EUR provider.
    
    - **Currency**: EUR
    - **Focus**: Winter Sports, Premium Climbing
    - **Error Rate**: ~30% (simulated in production)
    """
    config = PROVIDER_CONFIGS[Provider.ALPINE_GEAR]
    products = await MockProviderService.get_alpine_gear_products()
    return MockProviderResponse.create(
        provider=config["slug"],
        currency=config["currency"],
        products=products
    )
