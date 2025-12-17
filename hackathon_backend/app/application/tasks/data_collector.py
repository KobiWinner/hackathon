import asyncio
import structlog
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.core.config.celery import celery_app
from app.infrastructure.mocker_client import MockerClient
from app.domain.schemas.product import UnifiedProduct, Provider
from app.infrastructure.unit_of_work import UnitOfWork
from app.core.infrastructure.cache import get_cache
from app.core.infrastructure.exchange_rate_provider import ExchangeRateApiProvider
from app.application.services.price.currency_service import CurrencyService
from app.application.pipelines.analytics.product_analysis_pipeline import ProductAnalysisPipeline
from app.core.patterns.pipeline import PipelineContext

logger = structlog.get_logger()

@celery_app.task
def collect_data_task():
    """Celery task wrapper for async data collection."""
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(collect_data())

async def collect_data():
    logger.info("Starting data collection from all providers...")
    
    # Initialize Services
    exchange_provider = ExchangeRateApiProvider()
    cache_service = get_cache()
    # Manual instantiation of CurrencyService (could be via DI container if available)
    currency_service = CurrencyService(exchange_provider, cache_service)
    
    # Initialize Clients
    client = MockerClient()

    # Fetch data concurrently
    results = await asyncio.gather(
        client.get_sport_direct_products(),
        client.get_outdoor_pro_products(),
        client.get_dag_spor_products(),
        client.get_alpine_gear_products(),
        return_exceptions=True
    )

    sport_res, outdoor_res, dag_res, alpine_res = results
    
    products: List[UnifiedProduct] = []
    collected_at = datetime.utcnow()

    # --- Processing Logic (Existing) ---
    # SportDirect
    if isinstance(sport_res, dict):
        for item in sport_res.get("products", []):
            products.append(UnifiedProduct(
                provider=Provider.SPORT_DIRECT,
                provider_product_id=str(item["product_id"]),
                name=item["product_name"],
                description=f"{item.get('brand')} - {item.get('category')}",
                price=item["price_gbp"],
                currency="GBP",
                stock=item["stock_quantity"],
                collected_at=collected_at
            ))
    
    # OutdoorPro
    if isinstance(outdoor_res, dict):
        for item in outdoor_res.get("items", []):
            products.append(UnifiedProduct(
                provider=Provider.OUTDOOR_PRO,
                provider_product_id=str(item["id"]),
                name=item["name"],
                description=f"{item.get('brand')} - {item.get('category')}",
                price=item["price"],
                currency=item["currency"],
                stock=item["stock"],
                collected_at=collected_at
            ))

    # DagSpor
    if isinstance(dag_res, dict):
        for item in dag_res.get("urunler", []):
            products.append(UnifiedProduct(
                provider=Provider.DAG_SPOR,
                provider_product_id=str(item["urun_id"]),
                name=item["urun_adi"],
                description=f"{item.get('marka')} - {item.get('kategori')}",
                price=item["fiyat"],
                currency=item["para_birimi"],
                stock=item["stok_adedi"],
                collected_at=collected_at
            ))

    # AlpineGear
    if isinstance(alpine_res, dict):
        for item in alpine_res.get("catalog", []):
            products.append(UnifiedProduct(
                provider=Provider.ALPINE_GEAR,
                provider_product_id=str(item["sku"]),
                name=item["title"],
                description=f"Manufacturer: {item.get('manufacturer')}",
                price=item["price_eur"],
                currency="EUR",
                stock=item["qty"],
                collected_at=collected_at
            ))
            
    logger.info("Raw data collected", count=len(products))

    # --- Pipeline Execution ---
    async with UnitOfWork() as uow:
        # 1. Fetch Provider IDs
        provider_map = await uow.providers.get_all_as_dict()
        
        # 2. Prepare Data for Pipeline
        pipeline_data = []
        for p in products:
            # "sport_direct" -> "sport-direct" conversion might be needed if slugs differ
            # My UnifiedProduct uses snake_case, but DB might have different slugs.
            # Assuming slugs in DB match UnifiedProduct enum values (snake or kebab).
            
            # Provider.SPORT_DIRECT.value is "sport_direct"
            p_slug = p.provider.value
            # Try direct match or kebab-case match
            provider_id = provider_map.get(p_slug) or provider_map.get(p_slug.replace("_", "-"))
            
            if not provider_id:
                logger.warning("provider_not_found", slug=p_slug)
                continue
                
            data_dict = p.model_dump()
            data_dict["provider_id"] = provider_id
            data_dict["external_product_code"] = p.provider_product_id
            data_dict["product_url"] = p.url
            data_dict["stock_quantity"] = p.stock
            data_dict["in_stock"] = p.stock > 0
            # Pipeline expects 'price' and 'currency' which are already there
            
            pipeline_data.append(data_dict)

        if not pipeline_data:
            logger.warning("No valid data for pipeline")
            return {"status": "warning", "message": "No valid data to process"}

        # 3. Run Pipeline
        # 3. Run Pipeline
        pipeline = ProductAnalysisPipeline(uow, currency_service)
        
        # BasePipeline.execute wraps data in PipelineContext automatically
        context = await pipeline.execute(pipeline_data)
        
        # 4. Commit results
        if context.result and not context.errors: # Check success based on result/errors
             # Note: PipelineContext property 'success' might not exist or be meta-based, checking errors is safer
            if not context.errors:
                await uow.commit()
                logger.info("Pipeline completed successfully", 
                            saved=context.meta.get("saved_price_records"), 
                            errors=context.meta.get("price_save_errors"))
                return {
                    "status": "success", 
                    "products_collected": len(products),
                    "pipeline_stats": context.meta
                }
            else:
                await uow.rollback()
                logger.error("Pipeline failed", errors=context.errors)
                return {"status": "error", "errors": context.errors}
        else:
             await uow.rollback()
             logger.error("Pipeline failed", errors=context.errors)
             return {"status": "error", "errors": context.errors}
