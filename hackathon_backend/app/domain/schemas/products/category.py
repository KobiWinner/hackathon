from typing import Optional

from pydantic import BaseModel


class CategoryBase(BaseModel):
    parent_id: Optional[int] = None
    name: str
    slug: Optional[str] = None