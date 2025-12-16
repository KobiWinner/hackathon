from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity
from app.persistence.models.products.category import Category


class Product(BaseEntity):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=True)
    brand = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product")
