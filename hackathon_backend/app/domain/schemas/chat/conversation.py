from pydantic import BaseModel


class ConversationBase(BaseModel):
    user_id: int
    mapping_id: int
    status: str = "open"