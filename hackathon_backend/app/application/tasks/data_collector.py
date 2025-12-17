import asyncio
import structlog
from datetime import datetime
from typing import List

from app.core.config.celery import celery_app
from app.application.services.mock.mock_provider_service import MockProviderService
from app.domain.schemas.product import UnifiedProduct
from app.infrastructure.unit_of_work import UnitOfWork
from app.core.infrastructure.cache import get_cache
from app.core.infrastructure.exchange_rate_provider import ExchangeRateApiProvider
from app.application.services.price.currency_service import CurrencyService
from app.application.pipelines.analytics.product_analysis_pipeline import ProductAnalysisPipeline

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
    currency_service = CurrencyService(exchange_provider, cache_service)
    
    # Fetch data from internal mock service (no HTTP calls)
    products: List[UnifiedProduct] = await MockProviderService.get_all_products()
    
    logger.info("Raw data collected", count=len(products))

    # --- Pipeline Execution ---
    async with UnitOfWork() as uow:
        # 1. Fetch Provider IDs
        provider_map = await uow.providers.get_all_as_dict()
        
        # 2. Prepare Data for Pipeline
        pipeline_data = []
        for p in products:
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
            
            pipeline_data.append(data_dict)

        if not pipeline_data:
            logger.warning("No valid data for pipeline")
            return {"status": "warning", "message": "No valid data to process"}

        # 3. Run Pipeline
        pipeline = ProductAnalysisPipeline(uow, currency_service)
        
        # BasePipeline.execute wraps data in PipelineContext automatically
        context = await pipeline.execute(pipeline_data)
        
        # 4. Commit results
        if context.result and not context.errors:
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
