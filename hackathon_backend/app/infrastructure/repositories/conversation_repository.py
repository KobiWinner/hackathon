"""Conversation Repository Implementation."""

from datetime import datetime, timezone
from typing import List, Optional, Type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.i_repositories.i_conversation_repository import IConversationRepository
from app.domain.schemas.chat.conversation import (
    Conversation as ConversationSchema,
)
from app.domain.schemas.chat.conversation import (
    ConversationCreate,
)
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.chat.conversation import Conversation as ConversationModel


class ConversationRepository(BaseRepository, IConversationRepository):
    """
    Conversation Repository Implementation.
    Chat konuşmaları için CRUD ve özel sorgu metodları.
    """

    orm_model: Type[ConversationModel] = ConversationModel
    schema_class: Type[ConversationSchema] = ConversationSchema

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_by_user_id(
        self, user_id: int, *, limit: int = 50, offset: int = 0
    ) -> List[ConversationSchema]:
        """Kullanıcının tüm konuşmalarını getirir (en yeniden eskiye)."""
        result = await self.db.execute(
            select(ConversationModel)
            .where(ConversationModel.user_id == user_id)
            .order_by(ConversationModel.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        db_objs = result.scalars().all()
        return [self._to_schema(obj) for obj in db_objs]  # type: ignore

    async def get_by_mapping_id(
        self, mapping_id: int, user_id: int
    ) -> Optional[ConversationSchema]:
        """Belirli bir product mapping için kullanıcının konuşmasını getirir."""
        result = await self.db.execute(
            select(ConversationModel).where(
                ConversationModel.mapping_id == mapping_id,
                ConversationModel.user_id == user_id,
            )
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore

    async def get_with_messages(
        self, conversation_id: int, user_id: int
    ) -> Optional[ConversationSchema]:
        """Konuşmayı mesajlarıyla birlikte getirir."""
        result = await self.db.execute(
            select(ConversationModel)
            .options(selectinload(ConversationModel.messages))
            .where(
                ConversationModel.id == conversation_id,
                ConversationModel.user_id == user_id,
            )
        )
        db_obj = result.scalars().first()
        return self._to_schema(db_obj) if db_obj else None  # type: ignore

    async def create_for_user(
        self, *, user_id: int, obj_in: ConversationCreate, commit: bool = True
    ) -> ConversationSchema:
        """Belirli bir kullanıcı için konuşma oluşturur."""
        db_obj = ConversationModel(
            user_id=user_id,
            mapping_id=obj_in.mapping_id,
            status="open",
        )
        self.db.add(db_obj)
        if commit:
            await self.db.commit()
            await self.db.refresh(db_obj)
        else:
            await self.db.flush()
        return self._to_schema(db_obj)  # type: ignore

    async def close_conversation(
        self, conversation_id: int, user_id: int
    ) -> Optional[ConversationSchema]:
        """Konuşmayı kapatır."""
        result = await self.db.execute(
            select(ConversationModel).where(
                ConversationModel.id == conversation_id,
                ConversationModel.user_id == user_id,
            )
        )
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.status = "closed"
            db_obj.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(db_obj)
            return self._to_schema(db_obj)  # type: ignore
        return None
