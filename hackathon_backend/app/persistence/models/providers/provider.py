from sqlalchemy import Boolean, Column, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class Provider(BaseEntity):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=True)
    description = Column(Text, nullable=True)
    base_url = Column(String(255), nullable=True)
    logo_url = Column(String(255), nullable=True)
    rating = Column(Numeric(2, 1), default=0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    total_sales_count = Column(Integer, default=0, nullable=False)
    response_rate = Column(Integer, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), default="Turkey", nullable=False)
    reliability_score = Column(Numeric(3, 2), default=1.00, nullable=False)
    data_quality_score = Column(Integer, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)

    product_mappings = relationship("ProductMapping", back_populates="provider")
