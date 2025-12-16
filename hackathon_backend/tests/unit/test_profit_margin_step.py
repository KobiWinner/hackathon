"""
Unit tests for ProfitMarginStep.
"""

from decimal import Decimal
from typing import Any, Dict, List
from unittest.mock import MagicMock

import pytest

from app.application.pipelines.analytics.steps.profit_margin_step import (
    ProfitMarginStep,
)
from app.core.patterns.pipeline import PipelineContext


class MockPriceHistory:
    """Mock PriceHistory record."""

    def __init__(self, price: float) -> None:
        self.price = Decimal(str(price))


class MockPriceHistoryRepository:
    """Mock PriceHistoryRepository for testing."""

    def __init__(self, histories: Dict[int, List[float]] | None = None) -> None:
        self.histories = histories or {}

    async def get_by_mapping_id(
        self, mapping_id: int, limit: int = 100
    ) -> List[MockPriceHistory]:
        prices = self.histories.get(mapping_id, [])
        return [MockPriceHistory(p) for p in prices[:limit]]


class MockUnitOfWork:
    """Mock UnitOfWork for testing."""

    def __init__(self, histories: Dict[int, List[float]] | None = None) -> None:
        self.price_histories = MockPriceHistoryRepository(histories)


class TestProfitMarginStep:
    """Tests for ProfitMarginStep."""

    @pytest.mark.asyncio
    async def test_uses_avg_price_from_trend_analysis(self) -> None:
        """Test that avg_price from TrendAnalysis is used for market average."""
        mock_uow = MockUnitOfWork()
        products = [
            {
                "mapping_id": 1,
                "price": 80.0,
                "avg_price": 100.0,  # From TrendAnalysisStep
            }
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["market_avg_price"] == 100.0
        # (100 - 80) / 100 * 100 = 20%
        assert result["profit_margin_percent"] == 20.0
        assert result["is_arbitrage_opportunity"] is True  # 20% > 10% threshold

    @pytest.mark.asyncio
    async def test_uses_db_history_when_no_avg_price(self) -> None:
        """Test that DB price history is used when avg_price not provided."""
        histories = {1: [100.0, 110.0, 90.0]}  # avg = 100
        mock_uow = MockUnitOfWork(histories)
        products = [
            {"mapping_id": 1, "price": 80.0}  # No avg_price
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["market_avg_price"] == 100.0
        assert result["profit_margin_percent"] == 20.0

    @pytest.mark.asyncio
    async def test_positive_margin_cheaper_provider(self) -> None:
        """Test positive margin when provider price is below market average."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "price": 70.0, "avg_price": 100.0}
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["profit_margin_percent"] == 30.0  # (100-70)/100 * 100
        assert result["is_arbitrage_opportunity"] is True

    @pytest.mark.asyncio
    async def test_negative_margin_expensive_provider(self) -> None:
        """Test negative margin when provider price is above market average."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "price": 120.0, "avg_price": 100.0}
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["profit_margin_percent"] == -20.0  # (100-120)/100 * 100
        assert result["is_arbitrage_opportunity"] is False

    @pytest.mark.asyncio
    async def test_arbitrage_threshold(self) -> None:
        """Test custom arbitrage threshold."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "price": 85.0, "avg_price": 100.0}  # 15% margin
        ]

        # Custom threshold: 20%
        step = ProfitMarginStep(mock_uow, arbitrage_threshold=20.0)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["profit_margin_percent"] == 15.0
        assert result["is_arbitrage_opportunity"] is False  # 15% < 20%

    @pytest.mark.asyncio
    async def test_no_market_data(self) -> None:
        """Test handling when no market data available."""
        mock_uow = MockUnitOfWork({})  # No history
        products = [
            {"mapping_id": 1, "price": 100.0}  # No avg_price, no DB history
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["has_market_data"] is False
        assert "profit_margin_percent" not in result

    @pytest.mark.asyncio
    async def test_product_without_price_passes_through(self) -> None:
        """Test that products without price pass through unchanged."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "name": "No Price Product"}
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert "profit_margin_percent" not in result
        assert result["name"] == "No Price Product"

    @pytest.mark.asyncio
    async def test_empty_product_list(self) -> None:
        """Test handling of empty product list."""
        mock_uow = MockUnitOfWork()
        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=[])

        await step.process(context)

        assert context.result is None

    @pytest.mark.asyncio
    async def test_meta_arbitrage_count(self) -> None:
        """Test meta information tracks arbitrage opportunities."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "price": 70.0, "avg_price": 100.0},  # 30% - arbitrage
            {"mapping_id": 2, "price": 95.0, "avg_price": 100.0},  # 5% - not arbitrage
            {"mapping_id": 3, "price": 50.0, "avg_price": 100.0},  # 50% - arbitrage
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert context.meta["arbitrage_opportunities"] == 2

    @pytest.mark.asyncio
    async def test_multiple_products_with_different_margins(self) -> None:
        """Test processing multiple products with varying margins."""
        mock_uow = MockUnitOfWork()
        products = [
            {"mapping_id": 1, "price": 80.0, "avg_price": 100.0},   # 20% margin
            {"mapping_id": 2, "price": 100.0, "avg_price": 100.0}, # 0% margin
            {"mapping_id": 3, "price": 110.0, "avg_price": 100.0}, # -10% margin
        ]

        step = ProfitMarginStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 3
        assert context.result[0]["profit_margin_percent"] == 20.0
        assert context.result[1]["profit_margin_percent"] == 0.0
        assert context.result[2]["profit_margin_percent"] == -10.0
