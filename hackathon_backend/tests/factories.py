from typing import Any

import factory
from factory import Faker

from app.domain.schemas.user import UserCreate
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
