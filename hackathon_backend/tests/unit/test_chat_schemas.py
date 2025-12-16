import pytest
from pydantic import ValidationError

from app.domain.schemas.chat.conversation import ConversationCreate
from app.domain.schemas.chat.message import MessageCreate, SenderType


def test_conversation_create_schema() -> None:
    """Test ConversationCreate schema validation."""
    # Valid data
    data = {"mapping_id": 1}
    schema = ConversationCreate(**data)
    assert schema.mapping_id == 1

    # Invalid data (missing mapping_id)
    with pytest.raises(ValidationError):
        ConversationCreate()


def test_message_create_schema() -> None:
    """Test MessageCreate schema validation."""
    # Valid data
    data = {"content": "Hello world", "sender_type": "user"}
    schema = MessageCreate(**data)
    assert schema.content == "Hello world"
    assert schema.sender_type == SenderType.USER

    # Valid data (enum value as string)
    data = {"content": "Hello world", "sender_type": "provider"}
    schema = MessageCreate(**data)
    assert schema.sender_type == SenderType.PROVIDER

    # Invalid data (empty content)
    with pytest.raises(ValidationError):
        MessageCreate(content="", sender_type="user")

    # Invalid data (invalid sender_type)
    with pytest.raises(ValidationError):
        MessageCreate(content="Hello", sender_type="invalid")

    # Content length limits (too long)
    with pytest.raises(ValidationError):
        MessageCreate(content="a" * 5001, sender_type="user")
