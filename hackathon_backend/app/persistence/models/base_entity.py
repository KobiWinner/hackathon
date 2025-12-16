from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.persistence.db.base import Base


class BaseEntity(Base):
    """
    Tüm entity'ler için temel sınıf.

    Sağladığı alanlar:
    - id: Primary key (auto-increment)
    - created_at: Oluşturulma zamanı (otomatik)
    - updated_at: Güncellenme zamanı (otomatik güncellenir)
    """

    __abstract__ = True  # Bu tablo oluşturulmayacak, sadece miras için

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now(),
    )

    updated_at: Mapped[Optional[datetime]] = mapped_column(
        default=None,
        onupdate=func.now(),
        server_onupdate=func.now(),
    )
