import asyncio
from typing import Optional, List
from celery import shared_task

from ..services.collector import get_data_collector


@shared_task(
    bind=True,
    name="collector.collect_all_providers",
    max_retries=3,
    default_retry_delay=60,
)
def collect_all_providers_task(self) -> dict:
    """
    Tüm provider'lardan veri toplama task'ı.
    
    Returns:
        dict: Toplama sonucu istatistikleri
    """
    try:
        collector = get_data_collector()
        
        # Async fonksiyonu sync context'te çalıştır
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(collector.collect_all())
        finally:
            loop.close()
        
        return result.to_dict()
        
    except Exception as e:
        print(f"[CollectorTask] Error: {e}")
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    name="collector.collect_single_provider",
    max_retries=3,
    default_retry_delay=30,
)
def collect_single_provider_task(self, provider_name: str) -> dict:
    """
    Tek bir provider'dan veri toplama task'ı.
    
    Args:
        provider_name: Provider adı (örn: "sport-direct")
        
    Returns:
        dict: Provider sonucu
    """
    try:
        collector = get_data_collector()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(collector.collect_single(provider_name))
        finally:
            loop.close()
        
        return result.to_dict()
        
    except Exception as e:
        print(f"[CollectorTask] Error for {provider_name}: {e}")
        raise self.retry(exc=e)


@shared_task(name="collector.invalidate_cache")
def invalidate_collector_cache_task(provider_name: Optional[str] = None) -> dict:
    """
    Collector cache'ini temizleme task'ı.
    
    Args:
        provider_name: Belirli provider için temizle, None ise tümünü temizle
        
    Returns:
        dict: İşlem sonucu
    """
    try:
        collector = get_data_collector()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(collector.invalidate_cache(provider_name))
        finally:
            loop.close()
        
        return {
            "success": True,
            "message": f"Cache invalidated for: {provider_name or 'all providers'}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
