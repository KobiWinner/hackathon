from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class Provider(str, Enum):
    SPORT_DIRECT = "sport_direct"
    OUTDOOR_PRO = "outdoor_pro"
    DAG_SPOR = "dag_spor"
    ALPINE_GEAR = "alpine_gear"

class UnifiedProduct(BaseModel):
    provider: Provider
    provider_product_id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str
    stock: int
    url: Optional[str] = None
    image_url: Optional[str] = None
    
    # Metadata for resilience and tracking
    collected_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
