"""Conversation Repository Interface."""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.i_repositories.i_base_repository import IBaseRepository
from app.domain.schemas.chat.conversation import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
)


class IConversationRepository(
    IBaseRepository[Conversation, ConversationCreate, ConversationUpdate], ABC
):
    """
    Conversation Repository Interface.
    Chat konuşmaları için özel metodları tanımlar.
    """

    @abstractmethod
    async def get_by_user_id(
        self, user_id: int, *, limit: int = 50, offset: int = 0
    ) -> List[Conversation]:
        """Kullanıcının tüm konuşmalarını getirir."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_mapping_id(
        self, mapping_id: int, user_id: int
    ) -> Optional[Conversation]:
        """Belirli bir product mapping için kullanıcının konuşmasını getirir."""
        raise NotImplementedError

    @abstractmethod
    async def get_with_messages(
        self, conversation_id: int, user_id: int
    ) -> Optional[Conversation]:
        """Konuşmayı mesajlarıyla birlikte getirir."""
        raise NotImplementedError

    @abstractmethod
    async def create_for_user(
        self, *, user_id: int, obj_in: ConversationCreate, commit: bool = True
    ) -> Conversation:
        """Belirli bir kullanıcı için konuşma oluşturur."""
        raise NotImplementedError

    @abstractmethod
    async def close_conversation(
        self, conversation_id: int, user_id: int
    ) -> Optional[Conversation]:
        """Konuşmayı kapatır."""
        raise NotImplementedError
