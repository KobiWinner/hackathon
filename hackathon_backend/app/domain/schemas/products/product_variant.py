from typing import Any, Dict, Optional

from pydantic import BaseModel


class ProductVariantBase(BaseModel):
    product_id: Optional[int] = None
    sku: Optional[str] = None
    attributes: Dict[str, Any]
    image_url: Optional[str] = None