from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class PriceTierBase(BaseModel):
    price_history_id: int
    min_quantity: int
    unit_price: Decimal
    condition_text: Optional[str] = None