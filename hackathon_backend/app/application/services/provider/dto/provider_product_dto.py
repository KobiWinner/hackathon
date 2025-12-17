from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ProviderProductDTO(BaseModel):
    provider_name: str
    provider_product_id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str
    stock: int
    url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    model_config = ConfigDict(from_attributes=True)
