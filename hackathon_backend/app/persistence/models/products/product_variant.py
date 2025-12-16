from sqlalchemy import Column, ForeignKey, Integer, String, JSON, Text
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class ProductVariant(BaseEntity):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sku = Column(String(255), unique=True, nullable=True)
    attributes = Column(JSON, nullable=False)
    image_url = Column(Text, nullable=True)

    product = relationship("Product", back_populates="variants")
