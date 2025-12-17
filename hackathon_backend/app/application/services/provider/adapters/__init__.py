from typing import Dict, Type

from .base_adapter import BaseProviderAdapter
from .sport_direct_adapter import SportDirectAdapter
from .outdoor_pro_adapter import OutdoorProAdapter
from .dag_spor_adapter import DagSporAdapter
from .alpine_gear_adapter import AlpineGearAdapter


# Provider adı -> Adapter sınıfı eşleştirmesi
ADAPTER_REGISTRY: Dict[str, Type[BaseProviderAdapter]] = {
    "sport-direct": SportDirectAdapter,
    "outdoor-pro": OutdoorProAdapter,
    "dag-spor": DagSporAdapter,
    "alpine-gear": AlpineGearAdapter,
}


def get_adapter(provider_name: str) -> BaseProviderAdapter:
    """
    Provider adına göre uygun adapter instance'ı döndürür.
    
    Args:
        provider_name: Provider slug (örn: "sport-direct")
        
    Returns:
        BaseProviderAdapter: İlgili adapter instance'ı
        
    Raises:
        ValueError: Bilinmeyen provider adı
    """
    adapter_class = ADAPTER_REGISTRY.get(provider_name)
    if adapter_class is None:
        available = ", ".join(ADAPTER_REGISTRY.keys())
        raise ValueError(
            f"Bilinmeyen provider: '{provider_name}'. "
            f"Mevcut provider'lar: {available}"
        )
    return adapter_class()


def get_all_adapters() -> Dict[str, BaseProviderAdapter]:
    """Tüm adapter instance'larını döndürür."""
    return {name: cls() for name, cls in ADAPTER_REGISTRY.items()}


__all__ = [
    "BaseProviderAdapter",
    "SportDirectAdapter",
    "OutdoorProAdapter",
    "DagSporAdapter",
    "AlpineGearAdapter",
    "get_adapter",
    "get_all_adapters",
    "ADAPTER_REGISTRY",
]
