from sqlalchemy import Column, Integer, Numeric, String

from app.persistence.models.base_entity import BaseEntity


class Currency(BaseEntity):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(3), unique=True, nullable=False)
    symbol = Column(String(5), nullable=True)
    name = Column(String(50), nullable=True)
    exchange_rate = Column(Numeric(10, 4), default=1.0000, nullable=False)
