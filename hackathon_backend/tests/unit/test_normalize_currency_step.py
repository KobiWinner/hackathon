"""
Unit tests for NormalizeCurrencyStep batch processing.
"""

from typing import Any, Dict, List
from unittest.mock import AsyncMock

import pytest

from app.application.pipelines.analytics.steps.normalize_currency_step import (
    NormalizeCurrencyStep,
)
from app.core.patterns.pipeline import PipelineContext


class MockCurrencyService:
    """Mock ICurrencyService for testing."""

    def __init__(self, rates: Dict[str, float] | None = None) -> None:
        self.rates = rates or {"USD": 34.20, "EUR": 37.50, "GBP": 43.10, "TRY": 1.0}
        self.get_exchange_rates_called = False

    async def get_exchange_rates(self) -> Dict[str, float]:
        self.get_exchange_rates_called = True
        return self.rates

    async def convert_price(self, amount: float, currency: str) -> float:
        rate = self.rates.get(currency.upper(), 1.0)
        return amount * rate


@pytest.fixture
def mock_currency_service() -> MockCurrencyService:
    return MockCurrencyService()


@pytest.fixture
def sample_batch_products() -> List[Dict[str, Any]]:
    return [
        {"id": "1", "name": "Nike Air Max", "price": "$199.99", "currency": "USD"},
        {"id": "2", "name": "Adidas Ultraboost", "price": "189,00", "currency": "EUR"},
        {"id": "3", "name": "Puma RS-X", "price": 1500.50, "currency": "TRY"},
        {"id": "4", "name": "Reebok Classic", "price": "£149.99", "currency": "GBP"},
    ]


class TestNormalizeCurrencyStepBatch:
    """Tests for batch processing in NormalizeCurrencyStep."""

    @pytest.mark.asyncio
    async def test_batch_normalization_success(
        self, mock_currency_service: MockCurrencyService, sample_batch_products: List[Dict[str, Any]]
    ) -> None:
        """Test successful batch normalization of products."""
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=sample_batch_products)

        await step.process(context)

        assert len(context.result) == 4
        assert context.meta["total_products"] == 4
        assert context.meta["normalized_count"] == 4
        assert context.meta["error_count"] == 0
        assert mock_currency_service.get_exchange_rates_called

    @pytest.mark.asyncio
    async def test_usd_to_try_conversion(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test USD to TRY conversion with specific rate."""
        products = [{"id": "1", "price": "100.00", "currency": "USD"}]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["original_price"] == 100.0
        assert result["original_currency"] == "USD"
        assert result["price"] == 3420.0  # 100 * 34.20
        assert result["currency"] == "TRY"

    @pytest.mark.asyncio
    async def test_european_price_format(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test European price format (1.234,56) parsing."""
        products = [{"id": "1", "price": "1.234,56", "currency": "EUR"}]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["original_price"] == 1234.56

    @pytest.mark.asyncio
    async def test_american_price_format(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test American price format ($1,234.56) parsing."""
        products = [{"id": "1", "price": "$1,234.56", "currency": "USD"}]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["original_price"] == 1234.56

    @pytest.mark.asyncio
    async def test_try_no_conversion(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test TRY prices are not converted."""
        products = [{"id": "1", "price": 1500.50, "currency": "TRY"}]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        result = context.result[0]
        assert result["original_price"] == 1500.50
        assert result["price"] == 1500.50
        assert result["currency"] == "TRY"

    @pytest.mark.asyncio
    async def test_missing_price_error(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test handling of products without price."""
        products = [
            {"id": "1", "name": "Valid", "price": 100, "currency": "TRY"},
            {"id": "2", "name": "Invalid"},  # No price
        ]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 1
        assert context.meta["normalized_count"] == 1
        assert context.meta["error_count"] == 1
        assert "ID 2: Fiyat bilgisi bulunamadı" in context.errors[0]

    @pytest.mark.asyncio
    async def test_invalid_currency_error(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test handling of unknown currency."""
        products = [{"id": "1", "price": 100, "currency": "XYZ"}]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 0
        assert "XYZ için kur bulunamadı" in context.errors[0]

    @pytest.mark.asyncio
    async def test_empty_product_list(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test handling of empty product list."""
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=[])

        await step.process(context)

        assert "Boş ürün listesi alındı" in context.errors[0]

    @pytest.mark.asyncio
    async def test_partial_batch_success(
        self, mock_currency_service: MockCurrencyService
    ) -> None:
        """Test that valid products are processed even if some fail."""
        products = [
            {"id": "1", "price": 100, "currency": "USD"},
            {"id": "2", "price": "invalid"},  # Will fail to parse
            {"id": "3", "price": 200, "currency": "EUR"},
        ]
        step = NormalizeCurrencyStep(mock_currency_service)
        context = PipelineContext(initial_data=products)

        await step.process(context)

        assert len(context.result) == 2
        assert context.meta["normalized_count"] == 2
        assert context.meta["error_count"] == 1
