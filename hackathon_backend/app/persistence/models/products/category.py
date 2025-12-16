from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class Category(BaseEntity):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=True)

    # Relationship to self for subcategories
    children = relationship("Category", back_populates="parent")
    parent = relationship("Category", remote_side=[id], back_populates="children")

    # Relationship to Product
    products = relationship("Product", back_populates="category")
