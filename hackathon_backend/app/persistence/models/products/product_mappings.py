from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.persistence.models.base_entity import BaseEntity


class ProductMapping(BaseEntity):
    __tablename__ = "product_mappings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    external_product_code = Column(String(255), nullable=False)
    estimated_profit_margin = Column(Numeric(5, 2), nullable=True)
    is_arbitrage_opportunity = Column(Boolean, default=False, server_default="false")
    product_url = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("provider_id", "external_product_code", name="uix_provider_external_code"),
    )

    # Relationships
    product = relationship("Product")
    provider = relationship("Provider", back_populates="product_mappings")
