"""
Unit tests for FindOrCreateMappingStep.
"""

from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.application.pipelines.analytics.steps.find_or_create_mapping_step import (
    FindOrCreateMappingStep,
)
from app.core.patterns.pipeline import PipelineContext
from app.domain.schemas.products.product_mapping import ProductMapping


class MockProductMappingRepository:
    """Mock ProductMappingRepository for testing."""

    def __init__(self) -> None:
        self.mappings: Dict[str, ProductMapping] = {}
        self.next_id = 1

    async def find_or_create(
        self, provider_id: int, external_product_code: str, product_url: str | None = None
    ) -> ProductMapping:
        key = f"{provider_id}:{external_product_code}"
        if key not in self.mappings:
            self.mappings[key] = ProductMapping(
                id=self.next_id,
                provider_id=provider_id,
                external_product_code=external_product_code,
                product_url=product_url,
            )
            self.next_id += 1
        return self.mappings[key]


class MockUnitOfWork:
    """Mock UnitOfWork for testing."""

    def __init__(self) -> None:
        self.product_mappings = MockProductMappingRepository()


@pytest.fixture
def mock_uow() -> MockUnitOfWork:
    return MockUnitOfWork()


@pytest.fixture
def sample_normalized_products() -> List[Dict[str, Any]]:
    return [
        {
            "id": "ext_123",
            "external_product_code": "ext_123",
            "provider_id": 1,
            "name": "Nike Air Max",
            "price": 6839.58,
            "currency": "TRY",
            "original_price": 199.99,
            "original_currency": "USD",
            "product_url": "https://example.com/nike",
        },
        {
            "id": "ext_456",
            "external_product_code": "ext_456",
            "provider_id": 1,
            "name": "Adidas Ultraboost",
            "price": 7087.50,
            "currency": "TRY",
            "original_price": 189.00,
            "original_currency": "EUR",
        },
    ]


class TestFindOrCreateMappingStep:
    """Tests for FindOrCreateMappingStep."""

    @pytest.mark.asyncio
    async def test_successful_mapping_creation(
        self, mock_uow: MockUnitOfWork, sample_normalized_products: List[Dict[str, Any]]
    ) -> None:
        """Test successful mapping creation for products."""
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=sample_normalized_products)

        await step.process(context)

        assert len(context.result) == 2
        assert context.result[0]["mapping_id"] == 1
        assert context.result[1]["mapping_id"] == 2
        assert context.meta["mappings_processed"] == 2
        assert context.meta["mapping_errors"] == 0

    @pytest.mark.asyncio
    async def test_mapping_preserves_original_data(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test that mapping step preserves all original product data."""
        products = [
            {
                "id": "ext_001",
                "provider_id": 1,
                "name": "Test Product",
                "price": 100.0,
                "custom_field": "custom_value",
            }
        ]
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["name"] == "Test Product"
        assert result["price"] == 100.0
        assert result["custom_field"] == "custom_value"
        assert "mapping_id" in result

    @pytest.mark.asyncio
    async def test_missing_provider_id_error(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test error handling for missing provider_id."""
        products = [
            {"id": "ext_001", "name": "No Provider"},  # No provider_id
            {"id": "ext_002", "provider_id": 1, "name": "Valid"},
        ]
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 1
        assert context.meta["mappings_processed"] == 1
        assert context.meta["mapping_errors"] == 1
        assert "provider_id eksik" in context.errors[0]

    @pytest.mark.asyncio
    async def test_empty_product_list(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test handling of empty product list."""
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=[])

        await step.process(context)

        # Should not fail, just do nothing
        assert context.result is None  # No result set for empty list

    @pytest.mark.asyncio
    async def test_uses_id_as_fallback_for_external_code(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test that 'id' is used when external_product_code is missing."""
        products = [
            {"id": "fallback_id", "provider_id": 1, "name": "Fallback Test"}
        ]
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 1
        # Verify the mapping was created with 'id' as external_code
        mapping = await mock_uow.product_mappings.find_or_create(1, "fallback_id")
        assert mapping.external_product_code == "fallback_id"

    @pytest.mark.asyncio
    async def test_reuses_existing_mapping(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test that existing mappings are reused, not duplicated."""
        # Pre-create a mapping
        await mock_uow.product_mappings.find_or_create(1, "existing_code")

        products = [
            {"id": "existing_code", "provider_id": 1, "name": "Existing Product"}
        ]
        step = FindOrCreateMappingStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        # Should reuse existing mapping (id=1), not create new one
        assert context.result[0]["mapping_id"] == 1
        assert mock_uow.product_mappings.next_id == 2  # Only one mapping created
