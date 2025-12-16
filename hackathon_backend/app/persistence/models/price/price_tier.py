from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class PriceTier(BaseEntity):
    __tablename__ = "price_tiers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    price_history_id = Column(Integer, ForeignKey("price_histories.id"), nullable=False)
    min_quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    condition_text = Column(String(255), nullable=True)

    price_history = relationship("PriceHistory", back_populates="price_tiers")
