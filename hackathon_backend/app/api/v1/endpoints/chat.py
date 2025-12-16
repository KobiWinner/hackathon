"""Chat API endpoints."""

from app.domain.schemas.auth import UserContext
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_uow
from app.domain.schemas.chat.conversation import (
    Conversation,
    ConversationCreate,
    ConversationListResponse,
)
from app.domain.schemas.chat.message import (
    Message,
    SenderType,
    SendMessageRequest,
    SendMessageResponse,
)
from app.infrastructure.unit_of_work import UnitOfWork

router = APIRouter()


@router.post("/conversations", response_model=Conversation, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> Conversation:
    """
    Yeni bir konuşma başlatır.

    Aynı product_mapping için zaten açık bir konuşma varsa, onu döner.
    """
    user_id = int(current_user.user_id)
    async with uow:
        # Check if conversation already exists for this mapping
        existing = await uow.conversations.get_by_mapping_id(
            data.mapping_id, user_id
        )
        if existing:
            return existing

        # Create new conversation
        conversation = await uow.conversations.create_for_user(
            user_id=user_id,
            obj_in=data,
        )
        return conversation


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> ConversationListResponse:
    """Kullanıcının tüm konuşmalarını listeler."""
    user_id = int(current_user.user_id)
    async with uow:
        conversations = await uow.conversations.get_by_user_id(
            user_id, limit=limit, offset=offset
        )
        return ConversationListResponse(
            conversations=conversations,
            total=len(conversations),
        )


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: int,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> Conversation:
    """Konuşma detayını mesajlarıyla birlikte getirir."""
    user_id = int(current_user.user_id)
    async with uow:
        conversation = await uow.conversations.get_with_messages(
            conversation_id, user_id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Konuşma bulunamadı",
            )
        return conversation


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
    status_code=201,
)
async def send_message(
    conversation_id: int,
    data: SendMessageRequest,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> SendMessageResponse:
    """
    Konuşmaya yeni bir mesaj gönderir.

    Sadece konuşmanın sahibi mesaj gönderebilir.
    """
    user_id = int(current_user.user_id)
    async with uow:
        # Check if conversation exists and belongs to user
        conversation = await uow.conversations.get(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Konuşma bulunamadı",
            )
        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu konuşmaya erişim yetkiniz yok",
            )
        if conversation.status == "closed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu konuşma kapatılmış",
            )

        # Create message
        message = await uow.messages.create_message(
            conversation_id=conversation_id,
            sender_type=SenderType.USER.value,
            content=data.content,
        )

        return SendMessageResponse(
            message=message,
            conversation_id=conversation_id,
        )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[Message],
)
async def get_messages(
    conversation_id: int,
    limit: int = 100,
    offset: int = 0,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> list[Message]:
    """Konuşmadaki mesajları getirir."""
    user_id = int(current_user.user_id)
    async with uow:
        # Check access
        conversation = await uow.conversations.get(conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Konuşma bulunamadı",
            )

        messages = await uow.messages.get_by_conversation_id(
            conversation_id, limit=limit, offset=offset
        )
        return messages


@router.put("/conversations/{conversation_id}/close", response_model=Conversation)
async def close_conversation(
    conversation_id: int,
    current_user: UserContext = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
) -> Conversation:
    """Konuşmayı kapatır."""
    user_id = int(current_user.user_id)
    async with uow:
        conversation = await uow.conversations.close_conversation(
            conversation_id, user_id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Konuşma bulunamadı",
            )
        return conversation
