"""
Unit tests for SavePriceHistoryStep.
"""

from decimal import Decimal
from typing import Any, Dict, List
from unittest.mock import AsyncMock

import pytest

from app.application.pipelines.analytics.steps.save_price_history_step import (
    SavePriceHistoryStep,
)
from app.core.patterns.pipeline import PipelineContext
from app.domain.schemas.price.price_history import PriceHistory, PriceHistoryCreate


class MockPriceHistoryRepository:
    """Mock PriceHistoryRepository for testing."""

    def __init__(self) -> None:
        self.records: List[PriceHistory] = []
        self.next_id = 1
        self.create_bulk_called = False
        self.last_items: List[PriceHistoryCreate] = []

    async def create_bulk(
        self, *, items: List[PriceHistoryCreate], commit: bool = True
    ) -> List[PriceHistory]:
        self.create_bulk_called = True
        self.last_items = items
        
        result = []
        for item in items:
            record = PriceHistory(
                id=self.next_id,
                mapping_id=item.mapping_id,
                price=item.price,
                original_price=item.original_price,
                discount_rate=item.discount_rate,
                currency_id=item.currency_id,
                in_stock=item.in_stock,
                stock_quantity=item.stock_quantity,
            )
            self.records.append(record)
            result.append(record)
            self.next_id += 1
        return result


class MockUnitOfWork:
    """Mock UnitOfWork for testing."""

    def __init__(self) -> None:
        self.price_histories = MockPriceHistoryRepository()


@pytest.fixture
def mock_uow() -> MockUnitOfWork:
    return MockUnitOfWork()


@pytest.fixture
def sample_products_with_mappings() -> List[Dict[str, Any]]:
    return [
        {
            "id": "ext_123",
            "mapping_id": 1,
            "name": "Nike Air Max",
            "price": 6839.58,
            "original_price": 199.99,
            "currency": "TRY",
            "in_stock": True,
            "stock_quantity": 50,
        },
        {
            "id": "ext_456",
            "mapping_id": 2,
            "name": "Adidas Ultraboost",
            "price": 7087.50,
            "original_price": 189.00,
            "currency": "TRY",
            "in_stock": True,
            "stock_quantity": 30,
        },
    ]


class TestSavePriceHistoryStep:
    """Tests for SavePriceHistoryStep."""

    @pytest.mark.asyncio
    async def test_successful_batch_save(
        self, mock_uow: MockUnitOfWork, sample_products_with_mappings: List[Dict[str, Any]]
    ) -> None:
        """Test successful batch price history save."""
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=sample_products_with_mappings)

        await step.process(context)

        assert mock_uow.price_histories.create_bulk_called
        assert len(mock_uow.price_histories.records) == 2
        assert context.meta["saved_price_records"] == 2
        assert context.meta["price_save_errors"] == 0

    @pytest.mark.asyncio
    async def test_price_values_correctly_saved(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test that price values are correctly converted to Decimal."""
        products = [
            {
                "mapping_id": 1,
                "price": 1234.56,
                "original_price": 100.00,
                "in_stock": True,
                "stock_quantity": 10,
            }
        ]
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        saved = mock_uow.price_histories.last_items[0]
        assert saved.price == Decimal("1234.56")
        assert saved.original_price == Decimal("100.00")
        assert saved.in_stock is True
        assert saved.stock_quantity == 10

    @pytest.mark.asyncio
    async def test_missing_mapping_id_error(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test error handling for missing mapping_id."""
        products = [
            {"id": "no_mapping", "price": 100.0},  # No mapping_id
            {"mapping_id": 1, "price": 200.0},  # Valid
        ]
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert context.meta["saved_price_records"] == 1
        assert context.meta["price_save_errors"] == 1
        assert "mapping_id eksik" in context.errors[0]

    @pytest.mark.asyncio
    async def test_missing_price_error(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test error handling for missing price."""
        products = [
            {"mapping_id": 1},  # No price
        ]
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert context.meta["saved_price_records"] == 0
        assert context.meta["price_save_errors"] == 1
        assert "price eksik" in context.errors[0]

    @pytest.mark.asyncio
    async def test_empty_product_list(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test handling of empty product list."""
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=[])

        await step.process(context)

        assert not mock_uow.price_histories.create_bulk_called
        assert context.meta.get("saved_price_records") is None or context.meta["saved_price_records"] == 0

    @pytest.mark.asyncio
    async def test_custom_currency_id(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test custom currency_id parameter."""
        products = [{"mapping_id": 1, "price": 100.0}]
        step = SavePriceHistoryStep(mock_uow, currency_id=5)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        saved = mock_uow.price_histories.last_items[0]
        assert saved.currency_id == 5

    @pytest.mark.asyncio
    async def test_optional_fields_handling(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test handling of optional fields."""
        products = [
            {
                "mapping_id": 1,
                "price": 100.0,
                # No original_price, discount_rate, stock_quantity
            }
        ]
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        saved = mock_uow.price_histories.last_items[0]
        assert saved.original_price is None
        assert saved.discount_rate is None
        assert saved.in_stock is True  # Default
        assert saved.stock_quantity is None

    @pytest.mark.asyncio
    async def test_discount_rate_saved(
        self, mock_uow: MockUnitOfWork
    ) -> None:
        """Test that discount_rate is correctly saved."""
        products = [
            {
                "mapping_id": 1,
                "price": 80.0,
                "original_price": 100.0,
                "discount_rate": 20,
            }
        ]
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        saved = mock_uow.price_histories.last_items[0]
        assert saved.discount_rate == 20

    @pytest.mark.asyncio
    async def test_result_unchanged(
        self, mock_uow: MockUnitOfWork, sample_products_with_mappings: List[Dict[str, Any]]
    ) -> None:
        """Test that result equals input data (data flows through unchanged)."""
        step = SavePriceHistoryStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=sample_products_with_mappings)

        await step.process(context)

        assert context.result == sample_products_with_mappings
