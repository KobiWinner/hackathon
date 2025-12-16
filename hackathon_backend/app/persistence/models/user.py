from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, ForeignKey, Integer, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.persistence.models.base_entity import BaseEntity

if TYPE_CHECKING:
    from app.persistence.models.role import Role

user_roles = Table(
    "user_roles",
    BaseEntity.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)


class User(BaseEntity):
    __tablename__ = "users"  # type: ignore[assignment]
    first_name: Mapped[str] = mapped_column(index=True)
    last_name: Mapped[str] = mapped_column(index=True)
    hashed_password: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True, index=True)
    phone_number: Mapped[Optional[str]] = mapped_column(
        unique=True, index=True, nullable=True
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)
    is_email_verified: Mapped[bool] = mapped_column(default=False)
    is_phone_verified: Mapped[bool] = mapped_column(default=False)

    roles: Mapped[List["Role"]] = relationship(
        "Role", secondary=user_roles, back_populates="users", lazy="selectin"
    )
