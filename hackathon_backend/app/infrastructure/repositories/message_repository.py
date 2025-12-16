"""Message Repository Implementation."""

from datetime import datetime, timezone
from typing import List, Optional, Type

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.i_repositories.i_message_repository import IMessageRepository
from app.domain.schemas.chat.message import (
    Message as MessageSchema,
)
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.chat.message import Message as MessageModel


class MessageRepository(BaseRepository, IMessageRepository):
    """
    Message Repository Implementation.
    Chat mesajları için CRUD ve özel sorgu metodları.
    """

    orm_model: Type[MessageModel] = MessageModel
    schema_class: Type[MessageSchema] = MessageSchema

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_by_conversation_id(
        self, conversation_id: int, *, limit: int = 100, offset: int = 0
    ) -> List[MessageSchema]:
        """Konuşmadaki tüm mesajları getirir (eskiden yeniye)."""
        result = await self.db.execute(
            select(MessageModel)
            .where(MessageModel.conversation_id == conversation_id)
            .order_by(MessageModel.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        db_objs = result.scalars().all()
        return [self._to_schema(obj) for obj in db_objs]  # type: ignore

    async def create_message(
        self,
        *,
        conversation_id: int,
        sender_type: str,
        content: str,
        commit: bool = True,
    ) -> MessageSchema:
        """Yeni mesaj oluşturur."""
        db_obj = MessageModel(
            conversation_id=conversation_id,
            sender_type=sender_type,
            content=content,
        )
        self.db.add(db_obj)
        if commit:
            await self.db.commit()
            await self.db.refresh(db_obj)
        else:
            await self.db.flush()
        return self._to_schema(db_obj)  # type: ignore

    async def mark_as_read(
        self, message_id: int, conversation_id: int
    ) -> Optional[MessageSchema]:
        """Mesajı okundu olarak işaretler."""
        result = await self.db.execute(
            select(MessageModel).where(
                MessageModel.id == message_id,
                MessageModel.conversation_id == conversation_id,
            )
        )
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.read_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(db_obj)
            return self._to_schema(db_obj)  # type: ignore
        return None

    async def get_unread_count(self, conversation_id: int, sender_type: str) -> int:
        """Belirli sender_type için okunmamış mesaj sayısını döner."""
        result = await self.db.execute(
            select(func.count(MessageModel.id)).where(
                MessageModel.conversation_id == conversation_id,
                MessageModel.sender_type != sender_type,
                MessageModel.read_at.is_(None),
            )
        )
        return result.scalar() or 0
