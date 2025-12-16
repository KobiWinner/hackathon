"""Conversation schemas for Chat API."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.domain.schemas.chat.message import Message

class ConversationBase(BaseModel):
    """Base conversation schema."""

    mapping_id: int
    status: str = "open"


class ConversationCreate(BaseModel):
    """Create a new conversation."""

    mapping_id: int


class ConversationUpdate(BaseModel):
    """Update conversation."""

    status: Optional[str] = None


class Conversation(ConversationBase):
    """Conversation response schema."""

    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True




class ConversationWithMessages(Conversation):
    """Conversation with messages included."""

    messages: List[Message] = []


class ConversationListResponse(BaseModel):
    """List of conversations response."""

    conversations: List[Conversation]
    total: int
