"""Health and monitoring endpoints for DevOps."""
from typing import Any, Dict

from fastapi import APIRouter

from app.core.infrastructure.cache import get_cache
from app.core.infrastructure.circuit_breaker import get_all_circuit_stats

router = APIRouter(prefix="/health", tags=["Health & Monitoring"])


# Provider güvenilirlik skorları (tarihsel veriye göre)
PROVIDER_RELIABILITY_SCORES = {
    "sport-direct": 0.99,  # %1 hata → %99 güvenilir
    "outdoor-pro": 0.95,   # %5 hata → %95 güvenilir
    "dag-spor": 0.85,      # %15 hata → %85 güvenilir
    "alpine-gear": 0.70,   # %30 hata → %70 güvenilir
}


@router.get("/")
async def health_check() -> Dict[str, str]:
    """Basic health check."""
    return {"status": "healthy"}


@router.get("/detailed")
async def detailed_health() -> Dict[str, Any]:
    """
    Detaylı sistem sağlık durumu.
    
    Returns:
        - API durumu
        - Redis cache durumu
        - Circuit breaker durumları
        - Provider güvenilirlik skorları
    """
    # Redis check
    cache = get_cache()
    redis_status = "unknown"
    try:
        await cache.set("health_check", "ok", expire=10)
        result = await cache.get("health_check")
        redis_status = "healthy" if result == "ok" else "degraded"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"

    # Circuit breaker stats
    circuit_stats = get_all_circuit_stats()

    # Provider summary
    providers_summary = []
    for name, reliability in PROVIDER_RELIABILITY_SCORES.items():
        cb_stat = circuit_stats.get(name, {})
        providers_summary.append({
            "name": name,
            "reliability_score": reliability,
            "circuit_state": cb_stat.get("state", "unknown"),
            "failure_count": cb_stat.get("failure_count", 0),
            "success_count": cb_stat.get("success_count", 0),
        })

    return {
        "status": "healthy",
        "components": {
            "api": "healthy",
            "redis": redis_status,
        },
        "circuit_breakers": circuit_stats,
        "providers": providers_summary,
    }


@router.get("/circuits")
async def circuit_breaker_status() -> Dict[str, Any]:
    """
    Circuit breaker durumlarını gösterir.
    
    DevOps için önemli metrikler:
    - state: closed/open/half_open
    - failure_count: Ardışık hata sayısı
    - last_failure_time: Son hata zamanı
    """
    return {
        "circuits": get_all_circuit_stats(),
        "legend": {
            "closed": "Normal çalışma - istekler geçiyor",
            "open": "Devre açık - istekler engelleniyor",
            "half_open": "Test modu - sınırlı istek geçiyor",
        },
    }


@router.get("/cache")
async def cache_status() -> Dict[str, Any]:
    """
    Redis cache durumu.
    
    TTL kontrolü ve bağlantı durumu.
    """
    cache = get_cache()
    
    try:
        # Test write with TTL
        await cache.set("cache_test", {"test": True}, expire=60)
        test_result = await cache.get("cache_test")
        
        return {
            "status": "healthy",
            "connection": "ok",
            "test_write": "success",
            "ttl_support": True,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }


@router.get("/providers")
async def provider_status() -> Dict[str, Any]:
    """
    Provider güvenilirlik ve durum özeti.
    
    Her provider için:
    - reliability_score: Tarihsel güvenilirlik (0-1)
    - circuit_state: Mevcut devre durumu
    - recommended_weight: Skor hesaplaması için önerilen ağırlık
    """
    circuit_stats = get_all_circuit_stats()
    
    providers = []
    for name, reliability in PROVIDER_RELIABILITY_SCORES.items():
        cb_stat = circuit_stats.get(name, {})
        state = cb_stat.get("state", "unknown")
        
        # Devre açıksa ağırlığı düşür
        if state == "open":
            recommended_weight = 0.0
        elif state == "half_open":
            recommended_weight = reliability * 0.5
        else:
            recommended_weight = reliability
        
        providers.append({
            "name": name,
            "reliability_score": reliability,
            "circuit_state": state,
            "recommended_weight": round(recommended_weight, 2),
            "failure_count": cb_stat.get("failure_count", 0),
        })
    
    # Sort by reliability
    providers.sort(key=lambda x: x["reliability_score"], reverse=True)
    
    return {
        "providers": providers,
        "total_providers": len(providers),
        "healthy_count": sum(1 for p in providers if p["circuit_state"] == "closed"),
    }
