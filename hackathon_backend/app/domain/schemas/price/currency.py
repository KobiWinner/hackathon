from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class CurrencyBase(BaseModel):
    code: str
    symbol: Optional[str] = None
    name: Optional[str] = None
    exchange_rate: Decimal = Decimal("1.0000")