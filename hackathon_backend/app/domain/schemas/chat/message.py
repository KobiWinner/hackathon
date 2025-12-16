from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MessageBase(BaseModel):
    conversation_id: int
    sender_type: str
    content: str
    read_at: Optional[datetime] = None