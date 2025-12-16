from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class PriceHistory(BaseEntity):
    __tablename__ = "price_histories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mapping_id = Column(Integer, ForeignKey("product_mappings.id"), nullable=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=True)
    discount_rate = Column(Integer, nullable=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=False)
    in_stock = Column(Boolean, default=True, nullable=False)
    stock_quantity = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    mapping = relationship("ProductMapping")
    variant = relationship("ProductVariant")
    currency = relationship("Currency")
    price_tiers = relationship("PriceTier", back_populates="price_history")
