from typing import TYPE_CHECKING, List

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.persistence.models.base_entity import BaseEntity

if TYPE_CHECKING:
    from app.persistence.models.user import User


class Role(BaseEntity):
    __tablename__ = "roles"  # type: ignore[assignment]
    name: Mapped[str] = mapped_column(unique=True, index=True)
    description: Mapped[str] = mapped_column(nullable=True)

    # "User" string usage avoids circular import issues at runtime
    users: Mapped[List["User"]] = relationship(
        "User",
        secondary="user_roles",  # Using string for secondary allows late binding!
        back_populates="roles",
    )
