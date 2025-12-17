import asyncio
import httpx
from typing import Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum

from .circuit_breaker import (
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitOpenError,
    get_circuit_breaker,
)


class RetryStrategy(Enum):
    """Retry stratejileri"""
    EXPONENTIAL = "exponential"  # 1s, 2s, 4s, 8s...
    LINEAR = "linear"            # 1s, 2s, 3s, 4s...
    FIXED = "fixed"              # 1s, 1s, 1s, 1s...


@dataclass
class HttpClientConfig:
    """HTTP Client yapılandırması"""
    timeout_seconds: float = 30.0
    max_retries: int = 3
    retry_strategy: RetryStrategy = RetryStrategy.EXPONENTIAL
    base_delay_seconds: float = 1.0
    max_delay_seconds: float = 60.0
    retry_status_codes: tuple = (429, 500, 502, 503, 504)
    
    # Circuit breaker config
    circuit_failure_threshold: int = 5
    circuit_timeout_seconds: float = 60.0


class ResilientHttpClient:
    """
    Retry ve Circuit Breaker destekli HTTP client.
    
    Özellikler:
    - Exponential backoff ile retry
    - Circuit breaker pattern
    - 429 (Rate Limit) için özel handling
    - Async/await desteği
    
    Kullanım:
        client = ResilientHttpClient("sport-direct")
        response = await client.get("http://localhost:8000/api/v1/...")
    """
    
    def __init__(
        self,
        provider_name: str,
        config: Optional[HttpClientConfig] = None,
    ):
        self.provider_name = provider_name
        self.config = config or HttpClientConfig()
        
        # Circuit breaker
        cb_config = CircuitBreakerConfig(
            failure_threshold=self.config.circuit_failure_threshold,
            timeout_seconds=self.config.circuit_timeout_seconds,
        )
        self.circuit_breaker = get_circuit_breaker(provider_name, cb_config)
        
        # HTTP client
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Lazy HTTP client initialization"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.config.timeout_seconds),
                follow_redirects=True,
            )
        return self._client
    
    async def close(self) -> None:
        """Client'ı kapat"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
    
    def _calculate_delay(self, attempt: int) -> float:
        """Retry delay hesapla"""
        if self.config.retry_strategy == RetryStrategy.EXPONENTIAL:
            delay = self.config.base_delay_seconds * (2 ** attempt)
        elif self.config.retry_strategy == RetryStrategy.LINEAR:
            delay = self.config.base_delay_seconds * (attempt + 1)
        else:  # FIXED
            delay = self.config.base_delay_seconds
        
        return min(delay, self.config.max_delay_seconds)
    
    async def get(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        GET request with retry and circuit breaker.
        
        Args:
            url: Request URL
            headers: Optional headers
            params: Optional query parameters
            
        Returns:
            JSON response as dict
            
        Raises:
            CircuitOpenError: Circuit açıksa
            httpx.HTTPError: Tüm retry'lar başarısız olursa
        """
        return await self._request("GET", url, headers=headers, params=params)
    
    async def _request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Internal request method with retry logic"""
        
        # Circuit breaker kontrolü
        if not self.circuit_breaker.can_execute():
            raise CircuitOpenError(self.provider_name)
        
        client = await self._get_client()
        last_exception: Optional[Exception] = None
        
        for attempt in range(self.config.max_retries + 1):
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json,
                )
                
                # Başarılı response
                if response.status_code == 200:
                    self.circuit_breaker.record_success()
                    return response.json()
                
                # Retry gereken status code
                if response.status_code in self.config.retry_status_codes:
                    last_exception = httpx.HTTPStatusError(
                        f"HTTP {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                    
                    # 429 için Retry-After header'ını kontrol et
                    if response.status_code == 429:
                        retry_after = response.headers.get("Retry-After")
                        if retry_after:
                            delay = float(retry_after)
                        else:
                            delay = self._calculate_delay(attempt)
                        print(
                            f"[{self.provider_name}] Rate limited (429). "
                            f"Waiting {delay:.1f}s before retry {attempt + 1}/{self.config.max_retries}"
                        )
                    else:
                        delay = self._calculate_delay(attempt)
                        print(
                            f"[{self.provider_name}] HTTP {response.status_code}. "
                            f"Retry {attempt + 1}/{self.config.max_retries} after {delay:.1f}s"
                        )
                    
                    if attempt < self.config.max_retries:
                        await asyncio.sleep(delay)
                        continue
                
                # Diğer hatalar (4xx) - retry yapma
                response.raise_for_status()
                
            except httpx.TimeoutException as e:
                last_exception = e
                delay = self._calculate_delay(attempt)
                print(
                    f"[{self.provider_name}] Timeout. "
                    f"Retry {attempt + 1}/{self.config.max_retries} after {delay:.1f}s"
                )
                if attempt < self.config.max_retries:
                    await asyncio.sleep(delay)
                    continue
            
            except httpx.ConnectError as e:
                last_exception = e
                delay = self._calculate_delay(attempt)
                print(
                    f"[{self.provider_name}] Connection error. "
                    f"Retry {attempt + 1}/{self.config.max_retries} after {delay:.1f}s"
                )
                if attempt < self.config.max_retries:
                    await asyncio.sleep(delay)
                    continue
        
        # Tüm retry'lar başarısız
        self.circuit_breaker.record_failure()
        
        if last_exception:
            raise last_exception
        
        raise httpx.HTTPError(f"Request failed after {self.config.max_retries} retries")
    
    def get_stats(self) -> dict:
        """Client ve circuit breaker istatistikleri"""
        return {
            "provider": self.provider_name,
            "circuit_breaker": self.circuit_breaker.get_stats(),
            "config": {
                "timeout": self.config.timeout_seconds,
                "max_retries": self.config.max_retries,
                "retry_strategy": self.config.retry_strategy.value,
            }
        }
