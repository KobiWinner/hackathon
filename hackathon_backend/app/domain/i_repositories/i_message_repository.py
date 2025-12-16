"""Message Repository Interface."""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.chat.message import (
    Message,
    MessageCreate,
    MessageUpdate,
)


class IMessageRepository(
    IBaseRepository[Message, MessageCreate, MessageUpdate], ABC
):
    """
    Message Repository Interface.
    Chat mesajları için özel metodları tanımlar.
    """

    @abstractmethod
    async def get_by_conversation_id(
        self, conversation_id: int, *, limit: int = 100, offset: int = 0
    ) -> List[Message]:
        """Konuşmadaki tüm mesajları getirir."""
        raise NotImplementedError

    @abstractmethod
    async def create_message(
        self,
        *,
        conversation_id: int,
        sender_type: str,
        content: str,
        commit: bool = True,
    ) -> Message:
        """Yeni mesaj oluşturur."""
        raise NotImplementedError

    @abstractmethod
    async def mark_as_read(
        self, message_id: int, conversation_id: int
    ) -> Optional[Message]:
        """Mesajı okundu olarak işaretler."""
        raise NotImplementedError

    @abstractmethod
    async def get_unread_count(self, conversation_id: int, sender_type: str) -> int:
        """Okunmamış mesaj sayısını döner."""
        raise NotImplementedError
