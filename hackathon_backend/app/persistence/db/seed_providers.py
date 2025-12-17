import asyncio
import logging
import sys

# Add project root to path
sys.path.append(".")

from sqlalchemy import text
from app.infrastructure.unit_of_work import UnitOfWork
from app.persistence.models.providers.provider import Provider
from app.persistence.models.price.currency import Currency

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    logger.info("Starting data seeding...")
    
    async with UnitOfWork() as uow:
        # 1. Seed Currencies
        currencies = [
            {"code": "TRY", "name": "Turkish Lira", "symbol": "₺"},
            {"code": "USD", "name": "US Dollar", "symbol": "$"},
            {"code": "EUR", "name": "Euro", "symbol": "€"},
            {"code": "GBP", "name": "British Pound", "symbol": "£"},
        ]
        
        for currency_data in currencies:
            result = await uow.db.execute(
                text(f"SELECT id FROM currencies WHERE code = '{currency_data['code']}'")
            )
            existing = result.scalar()
            
            if not existing:
                currency = Currency(**currency_data)
                uow.db.add(currency)
                logger.info(f"Adding currency: {currency_data['code']}")
            else:
                logger.info(f"Currency exists: {currency_data['code']}")
        
        # 2. Seed Providers
        providers = [
            {
                "name": "Sport Direct", 
                "slug": "sport_direct", 
                "base_url": "http://mocker_api:8000/api/v1/providers/sport-direct"
            },
            {
                "name": "Outdoor Pro", 
                "slug": "outdoor_pro", 
                "base_url": "http://mocker_api:8000/api/v1/providers/outdoor-pro"
            },
            {
                "name": "Dag Spor", 
                "slug": "dag_spor", 
                "base_url": "http://mocker_api:8000/api/v1/providers/dag-spor"
            },
            {
                "name": "Alpine Gear", 
                "slug": "alpine_gear", 
                "base_url": "http://mocker_api:8000/api/v1/providers/alpine-gear"
            },
        ]
        
        for provider_data in providers:
            stmt = text(f"SELECT id FROM providers WHERE slug = '{provider_data['slug']}'")
            result = await uow.db.execute(stmt)
            existing = result.scalar()
            
            if not existing:
                provider = Provider(**provider_data)
                uow.db.add(provider)
                logger.info(f"Adding provider: {provider_data['name']}")
            else:
                logger.info(f"Provider exists: {provider_data['name']}")
        
        await uow.commit()
        logger.info("Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
