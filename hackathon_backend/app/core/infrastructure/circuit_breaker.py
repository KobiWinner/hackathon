import time
from enum import Enum
from typing import Optional
from dataclasses import dataclass, field
from threading import Lock


class CircuitState(Enum):
    """Circuit Breaker durumları"""
    CLOSED = "closed"      # Normal çalışma - istekler geçiyor
    OPEN = "open"          # Devre açık - istekler engelleniyor
    HALF_OPEN = "half_open"  # Test modu - sınırlı istek geçiyor


@dataclass
class CircuitBreakerConfig:
    """Circuit Breaker yapılandırması"""
    failure_threshold: int = 5        # Devreyi açmak için gereken hata sayısı
    success_threshold: int = 2        # Devreyi kapatmak için gereken başarı sayısı
    timeout_seconds: float = 60.0     # OPEN durumunda bekleme süresi
    half_open_max_calls: int = 3      # HALF_OPEN'da izin verilen max istek


@dataclass
class CircuitStats:
    """Circuit Breaker istatistikleri"""
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: Optional[float] = None
    half_open_calls: int = 0


class CircuitBreaker:
    """
    Circuit Breaker Pattern implementasyonu.
    
    Durumlar:
    - CLOSED: Normal çalışma, istekler geçer
    - OPEN: Çok fazla hata sonrası, istekler engellenir
    - HALF_OPEN: Timeout sonrası test modu, sınırlı istek geçer
    
    Kullanım:
        cb = CircuitBreaker("sport-direct")
        
        if cb.can_execute():
            try:
                result = make_request()
                cb.record_success()
            except Exception as e:
                cb.record_failure()
                raise
        else:
            raise CircuitOpenError("Circuit is open")
    """
    
    def __init__(
        self,
        name: str,
        config: Optional[CircuitBreakerConfig] = None
    ):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._stats = CircuitStats()
        self._lock = Lock()
    
    @property
    def state(self) -> CircuitState:
        """Mevcut circuit durumu"""
        with self._lock:
            self._check_state_transition()
            return self._state
    
    @property
    def is_closed(self) -> bool:
        return self.state == CircuitState.CLOSED
    
    @property
    def is_open(self) -> bool:
        return self.state == CircuitState.OPEN
    
    def can_execute(self) -> bool:
        """İstek yapılıp yapılamayacağını kontrol eder"""
        with self._lock:
            self._check_state_transition()
            
            if self._state == CircuitState.CLOSED:
                return True
            
            if self._state == CircuitState.OPEN:
                return False
            
            # HALF_OPEN durumunda sınırlı istek
            if self._state == CircuitState.HALF_OPEN:
                if self._stats.half_open_calls < self.config.half_open_max_calls:
                    self._stats.half_open_calls += 1
                    return True
                return False
        
        return False
    
    def record_success(self) -> None:
        """Başarılı istek kaydı"""
        with self._lock:
            self._stats.success_count += 1
            
            if self._state == CircuitState.HALF_OPEN:
                if self._stats.success_count >= self.config.success_threshold:
                    self._transition_to(CircuitState.CLOSED)
            elif self._state == CircuitState.CLOSED:
                # Başarılı isteklerde failure count'u sıfırla
                self._stats.failure_count = 0
    
    def record_failure(self) -> None:
        """Başarısız istek kaydı"""
        with self._lock:
            self._stats.failure_count += 1
            self._stats.last_failure_time = time.time()
            
            if self._state == CircuitState.HALF_OPEN:
                # HALF_OPEN'da bir hata bile devreyi tekrar açar
                self._transition_to(CircuitState.OPEN)
            elif self._state == CircuitState.CLOSED:
                if self._stats.failure_count >= self.config.failure_threshold:
                    self._transition_to(CircuitState.OPEN)
    
    def _check_state_transition(self) -> None:
        """Timeout sonrası otomatik durum geçişi"""
        if self._state == CircuitState.OPEN:
            if self._stats.last_failure_time:
                elapsed = time.time() - self._stats.last_failure_time
                if elapsed >= self.config.timeout_seconds:
                    self._transition_to(CircuitState.HALF_OPEN)
    
    def _transition_to(self, new_state: CircuitState) -> None:
        """Durum geçişi"""
        old_state = self._state
        self._state = new_state
        
        # İstatistikleri sıfırla
        if new_state == CircuitState.CLOSED:
            self._stats = CircuitStats()
        elif new_state == CircuitState.HALF_OPEN:
            self._stats.success_count = 0
            self._stats.half_open_calls = 0
        
        print(f"[CircuitBreaker:{self.name}] {old_state.value} -> {new_state.value}")
    
    def reset(self) -> None:
        """Manuel sıfırlama"""
        with self._lock:
            self._state = CircuitState.CLOSED
            self._stats = CircuitStats()
    
    def get_stats(self) -> dict:
        """İstatistikleri döndür"""
        with self._lock:
            return {
                "name": self.name,
                "state": self._state.value,
                "failure_count": self._stats.failure_count,
                "success_count": self._stats.success_count,
                "last_failure_time": self._stats.last_failure_time,
            }


class CircuitOpenError(Exception):
    """Circuit açık olduğunda fırlatılır"""
    def __init__(self, circuit_name: str):
        self.circuit_name = circuit_name
        super().__init__(f"Circuit '{circuit_name}' is OPEN. Request blocked.")


# Global circuit breaker registry
_circuit_breakers: dict[str, CircuitBreaker] = {}
_registry_lock = Lock()


def get_circuit_breaker(
    name: str,
    config: Optional[CircuitBreakerConfig] = None
) -> CircuitBreaker:
    """
    Circuit breaker instance'ı al veya oluştur (singleton per name).
    
    Args:
        name: Circuit breaker adı (genellikle provider adı)
        config: Opsiyonel yapılandırma
        
    Returns:
        CircuitBreaker instance
    """
    with _registry_lock:
        if name not in _circuit_breakers:
            _circuit_breakers[name] = CircuitBreaker(name, config)
        return _circuit_breakers[name]


def get_all_circuit_stats() -> dict:
    """Tüm circuit breaker istatistiklerini döndür"""
    with _registry_lock:
        return {name: cb.get_stats() for name, cb in _circuit_breakers.items()}
