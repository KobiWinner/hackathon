from typing import Any

import factory
from factory import Faker

from app.domain.schemas.user import UserCreate
from app.persistence.models.chat.conversation import Conversation
from app.persistence.models.chat.message import Message
from app.persistence.models.products.category import Category
from app.persistence.models.products.product import Product
from app.persistence.models.products.product_mappings import ProductMapping
from app.persistence.models.providers.provider import Provider
from app.persistence.models.user import User


class UserCreateFactory(factory.Factory):
    """Factory that builds UserCreate schema objects."""

    class Meta:
        model = UserCreate

    first_name = Faker("first_name")
    last_name = Faker("last_name")
    email = Faker("email")
    password = Faker("password")
    phone_number = Faker("phone_number")

    @classmethod
    def build(cls, **kwargs: Any) -> UserCreate:
        """Build a UserCreate instance."""
        return super().build(**kwargs)  # type: ignore[return-value, no-any-return]


class UserModelFactory(factory.Factory):
    """Factory that builds User model objects without saving to DB."""

    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    first_name = Faker("first_name")
    last_name = Faker("last_name")
    hashed_password = Faker("password")  # In real tests we might need meaningful hash
    email = Faker("email")
    phone_number = Faker("phone_number")
    is_active = True


class ConversationModelFactory(factory.Factory):
    """Factory that builds Conversation model objects."""

    class Meta:
        model = Conversation

    id = factory.Sequence(lambda n: n + 1)
    user_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())
    mapping_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())
    status = "open"


class MessageModelFactory(factory.Factory):
    """Factory that builds Message model objects."""

    class Meta:
        model = Message

    id = factory.Sequence(lambda n: n + 1)
    conversation_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())
    sender_type = "user"
    content = Faker("sentence")


class CategoryModelFactory(factory.Factory):
    class Meta:
        model = Category

    id = factory.Sequence(lambda n: n + 1)
    name = Faker("word")
    slug = Faker("slug")


class ProductModelFactory(factory.Factory):
    class Meta:
        model = Product

    id = factory.Sequence(lambda n: n + 1)
    name = Faker("name")
    slug = Faker("slug")
    category_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())


class ProviderModelFactory(factory.Factory):
    class Meta:
        model = Provider

    id = factory.Sequence(lambda n: n + 1)
    name = Faker("company")
    base_url = Faker("url")
    slug = Faker("slug")


class ProductMappingModelFactory(factory.Factory):
    class Meta:
        model = ProductMapping

    id = factory.Sequence(lambda n: n + 1)
    product_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())
    provider_id = factory.LazyAttribute(lambda o: Faker("random_int").generate())
    external_product_code = Faker("uuid4")
    product_url = Faker("url")
