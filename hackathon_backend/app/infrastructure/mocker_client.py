"""
MockerClient - Mocker Service ile iletişim.
Circuit Breaker ve Exponential Backoff ile dayanıklılık.
"""
import httpx
import structlog
from typing import Dict, Any, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config.settings import settings
from app.core.infrastructure.circuit_breaker import (
    get_circuit_breaker,
    CircuitOpenError,
    CircuitBreakerConfig,
)
from app.domain.schemas.product import Provider

logger = structlog.get_logger()


# Provider-specific circuit breaker configs
# Daha güvenilir provider'lar için daha yüksek threshold
PROVIDER_CB_CONFIGS = {
    "sport-direct": CircuitBreakerConfig(
        failure_threshold=10,  # %1 hata - daha toleranslı
        success_threshold=2,
        timeout_seconds=30.0,
    ),
    "outdoor-pro": CircuitBreakerConfig(
        failure_threshold=7,  # %5 hata
        success_threshold=2,
        timeout_seconds=45.0,
    ),
    "dag-spor": CircuitBreakerConfig(
        failure_threshold=5,  # %15 hata
        success_threshold=3,
        timeout_seconds=60.0,
    ),
    "alpine-gear": CircuitBreakerConfig(
        failure_threshold=3,  # %30 hata - daha sıkı
        success_threshold=3,
        timeout_seconds=90.0,
    ),
}


class MockerClient:
    """
    Client for interacting with the Mocker Service.
    Includes resilience patterns (Retry + Circuit Breaker).
    """

    BASE_URL = "http://host.docker.internal:8002/api/v1/providers"

    def __init__(self) -> None:
        self.timeout = httpx.Timeout(10.0, connect=5.0)
        # Initialize circuit breakers for each provider
        self._circuit_breakers = {
            name: get_circuit_breaker(name, config)
            for name, config in PROVIDER_CB_CONFIGS.items()
        }

    def _get_cb(self, provider_name: str):
        """Get circuit breaker for provider."""
        return self._circuit_breakers.get(
            provider_name, get_circuit_breaker(provider_name)
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True,
    )
    async def _fetch_with_retry(
        self, client: httpx.AsyncClient, url: str
    ) -> Dict[str, Any]:
        """Fetch with retry logic (called inside circuit breaker)."""
        response = await client.get(url)
        response.raise_for_status()
        return response.json()

    async def _fetch_with_circuit_breaker(
        self, provider_name: str, endpoint: str
    ) -> Dict[str, Any]:
        """
        Fetch with circuit breaker protection.
        
        Flow:
        1. Check if circuit is open
        2. If closed/half-open, make request with retry
        3. Record success/failure to circuit breaker
        """
        cb = self._get_cb(provider_name)
        url = f"{self.BASE_URL}{endpoint}"

        # Check circuit state
        if not cb.can_execute():
            logger.warning(
                "circuit_open",
                provider=provider_name,
                state=cb.state.value,
            )
            raise CircuitOpenError(provider_name)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                result = await self._fetch_with_retry(client, url)
                cb.record_success()
                logger.debug(
                    "fetch_success",
                    provider=provider_name,
                    circuit_state=cb.state.value,
                )
                return result

            except httpx.HTTPStatusError as e:
                cb.record_failure()
                logger.error(
                    "api_error",
                    provider=provider_name,
                    url=url,
                    status_code=e.response.status_code,
                    circuit_state=cb.state.value,
                )
                raise

            except httpx.RequestError as e:
                cb.record_failure()
                logger.error(
                    "network_error",
                    provider=provider_name,
                    url=url,
                    error=str(e),
                    circuit_state=cb.state.value,
                )
                raise

    async def get_sport_direct_products(self) -> Dict[str, Any]:
        """SportDirect - UK/GBP - %1 hata oranı"""
        return await self._fetch_with_circuit_breaker(
            "sport-direct", "/sport-direct/products"
        )

    async def get_outdoor_pro_products(self) -> Dict[str, Any]:
        """OutdoorPro - US/USD - %5 hata oranı"""
        return await self._fetch_with_circuit_breaker(
            "outdoor-pro", "/outdoor-pro/products"
        )

    async def get_dag_spor_products(self) -> Dict[str, Any]:
        """DagSpor - TR/TRY - %15 hata oranı"""
        return await self._fetch_with_circuit_breaker(
            "dag-spor", "/dag-spor/products"
        )

    async def get_alpine_gear_products(self) -> Dict[str, Any]:
        """AlpineGear - EU/EUR - %30 hata oranı"""
        return await self._fetch_with_circuit_breaker(
            "alpine-gear", "/alpine-gear/products"
        )

    def get_all_circuit_stats(self) -> Dict[str, Any]:
        """Tüm circuit breaker durumlarını döndür."""
        return {name: cb.get_stats() for name, cb in self._circuit_breakers.items()}
