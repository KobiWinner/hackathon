import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.auth import get_password_hash
from app.persistence.models.products.category import Category
from app.persistence.models.products.product import Product
from app.persistence.models.products.product_mappings import ProductMapping
from app.persistence.models.providers.provider import Provider
from app.persistence.models.user import User
from tests.factories import (
    CategoryModelFactory,
    ProductMappingModelFactory,
    ProductModelFactory,
    ProviderModelFactory,
    UserModelFactory,
)


@pytest.mark.asyncio
async def test_chat_full_flow(
    client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    """
    Test full chat flow:
    1. Login (Get Token)
    2. Create Conversation
    3. Send Message
    4. List Messages
    5. Close Conversation
    """
    # 1. Setup Data
    password = "testpassword"
    hashed_password = get_password_hash(password)
    user = UserModelFactory.create(hashed_password=hashed_password)
    db_session.add(user)
    
    category = CategoryModelFactory.create()
    db_session.add(category)
    await db_session.flush()

    product = ProductModelFactory.create(category_id=category.id)
    db_session.add(product)
    
    provider = ProviderModelFactory.create()
    db_session.add(provider)
    await db_session.flush()

    mapping = ProductMappingModelFactory.create(
        product_id=product.id, provider_id=provider.id
    )
    db_session.add(mapping)
    await db_session.commit()

    # 2. Login & Get Headers
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Conversation
    # POST /api/v1/chat/conversations
    conv_data = {"mapping_id": mapping.id}
    conv_res = await client.post(
        "/api/v1/chat/conversations", json=conv_data, headers=headers
    )
    assert conv_res.status_code == 201
    conversation = conv_res.json()
    conv_id = conversation["id"]
    assert conversation["mapping_id"] == mapping.id
    assert conversation["status"] == "open"

    # 4. Send Message
    # POST /api/v1/chat/conversations/{id}/messages
    msg_data = {"content": "Hello, is this available?"}
    msg_res = await client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        json=msg_data,
        headers=headers,
    )
    assert msg_res.status_code == 201
    message = msg_res.json()["message"]
    assert message["content"] == "Hello, is this available?"
    assert message["sender_type"] == "user"

    # 5. Get Messages
    # GET /api/v1/chat/conversations/{id}/messages
    msgs_res = await client.get(
        f"/api/v1/chat/conversations/{conv_id}/messages", headers=headers
    )
    assert msgs_res.status_code == 200
    messages = msgs_res.json()
    assert len(messages) == 1
    assert messages[0]["content"] == "Hello, is this available?"

    # 6. List Conversations
    # GET /api/v1/chat/conversations
    list_res = await client.get("/api/v1/chat/conversations", headers=headers)
    assert list_res.status_code == 200
    conversations = list_res.json()["conversations"]
    assert len(conversations) == 1
    assert conversations[0]["id"] == conv_id

    # 7. Close Conversation
    # PUT /api/v1/chat/conversations/{id}/close
    close_res = await client.put(
        f"/api/v1/chat/conversations/{conv_id}/close", headers=headers
    )
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "closed"

    # 8. Try sending message to closed conversation (Should fail)
    fail_res = await client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        json={"content": "Should fail"},
        headers=headers,
    )
    assert fail_res.status_code == 400
    assert "kapatılmış" in fail_res.json()["detail"]
