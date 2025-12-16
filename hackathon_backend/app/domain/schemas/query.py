from typing import Any, List, Literal

from pydantic import BaseModel, Field


# Hangi alan, hangi operatör, hangi değer?
class FilterParam(BaseModel):
    field: str
    operator: Literal[
        "eq", "neq", "gt", "lt", "gte", "lte", "contains", "in", "startswith"
    ]
    value: Any


# Hangi alan, hangi yön?
class SortParam(BaseModel):
    field: str
    direction: Literal["asc", "desc"] = "asc"


# Tüm arama isteğini kapsayan ana paket
class QueryParams(BaseModel):
    filters: List[FilterParam] = Field(default_factory=list)
    sort: List[SortParam] = Field(default_factory=list)
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size
