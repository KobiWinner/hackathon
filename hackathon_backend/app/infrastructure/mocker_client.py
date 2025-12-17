import httpx
import structlog
from typing import List, Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config.settings import settings
from app.domain.schemas.product import Provider

logger = structlog.get_logger()

class MockerClient:
    """
    Client for interacting with the Mocker Service.
    Includes resilience patterns (Retry, Circuit Breaker).
    """
    
    
    # External port üzerinden iletişim (test için)
    BASE_URL = "http://host.docker.internal:8002/api/v1/providers"

    def __init__(self):
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def _fetch(self, client: httpx.AsyncClient, endpoint: str) -> Dict[str, Any]:
        """Generic fetch method with retry logic."""
        url = f"{self.BASE_URL}{endpoint}"
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error("api_error", url=url, status_code=e.response.status_code, error=str(e))
            raise
        except httpx.RequestError as e:
            logger.error("network_error", url=url, error=str(e))
            raise

    async def get_sport_direct_products(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await self._fetch(client, "/sport-direct/products")

    async def get_outdoor_pro_products(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await self._fetch(client, "/outdoor-pro/products")

    async def get_dag_spor_products(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await self._fetch(client, "/dag-spor/products")

    async def get_alpine_gear_products(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await self._fetch(client, "/alpine-gear/products")
