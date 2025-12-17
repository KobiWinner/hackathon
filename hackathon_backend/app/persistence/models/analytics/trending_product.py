"""TrendingProduct model for storing top trending products."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class TrendingProduct(BaseEntity):
    """
    Cache tablosu: En yüksek trend skoruna sahip ürünleri saklar.
    Pipeline tarafından periyodik olarak güncellenir.
    """
    __tablename__ = "trending_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, unique=True)
    trend_score = Column(Integer, nullable=False, default=0)  # -100 to +100
    rank = Column(Integer, nullable=False)  # 1-5
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    product = relationship("Product", lazy="joined")
