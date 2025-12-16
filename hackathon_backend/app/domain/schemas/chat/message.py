"""Message schemas for Chat API."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class SenderType(str, Enum):
    """Message sender type."""

    USER = "user"
    PROVIDER = "provider"
    SYSTEM = "system"


class MessageBase(BaseModel):
    """Base message schema."""

    content: str = Field(..., min_length=1, max_length=5000)
    sender_type: SenderType = SenderType.USER


class MessageCreate(BaseModel):
    """Create a new message."""

    content: str = Field(..., min_length=1, max_length=5000)
    sender_type: SenderType = SenderType.USER


class MessageUpdate(BaseModel):
    """Update message (mark as read)."""

    read_at: Optional[datetime] = None


class Message(MessageBase):
    """Message response schema."""

    id: int
    conversation_id: int
    read_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    """Request to send a message."""

    content: str = Field(..., min_length=1, max_length=5000)


class SendMessageResponse(BaseModel):
    """Response after sending a message."""

    message: Message
    conversation_id: int
