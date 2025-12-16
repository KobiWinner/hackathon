from pydantic import BaseModel


class TrendHistoryBase(BaseModel):
    product_id: int
    score: int