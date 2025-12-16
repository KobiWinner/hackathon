"""
Unit tests for TrendAnalysisStep.
"""

from decimal import Decimal
from typing import Any, Dict, List
from unittest.mock import MagicMock

import pytest

from app.application.pipelines.analytics.steps.trend_analysis_step import (
    TrendAnalysisStep,
)
from app.core.patterns.pipeline import PipelineContext


class MockPriceHistory:
    """Mock PriceHistory record."""

    def __init__(self, price: float) -> None:
        self.price = Decimal(str(price))


class MockPriceHistoryRepository:
    """Mock PriceHistoryRepository for testing."""

    def __init__(self, histories: Dict[int, List[float]] | None = None) -> None:
        # mapping_id -> list of prices (newest first)
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


@pytest.fixture
def sample_products_with_mappings() -> List[Dict[str, Any]]:
    return [
        {"id": "prod_1", "mapping_id": 1, "price": 100.0},
        {"id": "prod_2", "mapping_id": 2, "price": 150.0},
    ]


class TestTrendAnalysisStep:
    """Tests for TrendAnalysisStep."""

    @pytest.mark.asyncio
    async def test_stable_trend(self) -> None:
        """Test stable trend when price is close to average."""
        histories = {1: [100.0, 100.0, 100.0, 100.0, 100.0]}
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 100.0}]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["trend_direction"] == "stable"
        assert -15 <= result["trend_score"] <= 15  # Allow small momentum variance
        assert abs(result["price_change_percent"]) <= 2.0

    @pytest.mark.asyncio
    async def test_upward_trend(self) -> None:
        """Test upward trend when current price is above average."""
        # History: older prices were lower
        histories = {1: [80.0, 70.0, 60.0, 50.0, 40.0]}  # avg = 60
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 100.0}]  # current is 100 (67% up)

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["trend_direction"] == "up"
        assert result["trend_score"] > 0
        assert result["price_change_percent"] > 0

    @pytest.mark.asyncio
    async def test_downward_trend(self) -> None:
        """Test downward trend when current price is below average."""
        # History: prices were higher
        histories = {1: [120.0, 130.0, 140.0, 150.0]}  # avg = 135
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 100.0}]  # current is 100 (26% down)

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["trend_direction"] == "down"
        assert result["trend_score"] < 0
        assert result["price_change_percent"] < 0

    @pytest.mark.asyncio
    async def test_insufficient_data(self) -> None:
        """Test handling when insufficient price history."""
        histories = {1: [100.0]}  # Only one record
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 100.0}]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["has_sufficient_data"] is False
        assert result["trend_score"] == 0
        assert result["trend_direction"] == "stable"

    @pytest.mark.asyncio
    async def test_no_history(self) -> None:
        """Test handling when no price history exists."""
        mock_uow = MockUnitOfWork({})  # Empty history
        products = [{"mapping_id": 1, "price": 100.0}]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["has_sufficient_data"] is False

    @pytest.mark.asyncio
    async def test_min_max_avg_calculation(self) -> None:
        """Test min, max, avg price calculation."""
        histories = {1: [100.0, 150.0, 200.0, 50.0]}  # min=50, max=200, avg=125
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 125.0}]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["min_price"] == 50.0
        assert result["max_price"] == 200.0
        assert result["avg_price"] == 125.0

    @pytest.mark.asyncio
    async def test_product_without_mapping_id_passes_through(self) -> None:
        """Test that products without mapping_id pass through unchanged."""
        mock_uow = MockUnitOfWork({})
        products = [{"id": "no_mapping", "price": 100.0}]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert "trend_score" not in result  # No trend analysis added
        assert result["id"] == "no_mapping"

    @pytest.mark.asyncio
    async def test_trend_score_bounds(self) -> None:
        """Test that trend score stays within -100 to +100."""
        # Extreme case: 1000% increase
        histories = {1: [10.0, 10.0, 10.0]}  # avg = 10
        mock_uow = MockUnitOfWork(histories)
        products = [{"mapping_id": 1, "price": 1000.0}]  # 9900% increase

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["trend_score"] <= 100
        assert result["trend_score"] >= -100

    @pytest.mark.asyncio
    async def test_empty_product_list(self) -> None:
        """Test handling of empty product list."""
        mock_uow = MockUnitOfWork({})
        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=[])

        await step.process(context)

        assert context.result is None  # No result for empty list

    @pytest.mark.asyncio
    async def test_meta_information(self) -> None:
        """Test meta information is correctly set."""
        histories = {1: [100.0, 100.0, 100.0]}
        mock_uow = MockUnitOfWork(histories)
        products = [
            {"mapping_id": 1, "price": 100.0},
            {"id": "no_mapping", "price": 50.0},  # No mapping_id
        ]

        step = TrendAnalysisStep(mock_uow)  # type: ignore
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert context.meta["trend_analyzed_count"] == 1
        assert context.meta["trend_analysis_errors"] == 0
