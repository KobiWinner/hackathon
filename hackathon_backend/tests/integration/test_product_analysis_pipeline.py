"""
Integration tests for ProductAnalysisPipeline.
Tests the full pipeline flow with mocked dependencies.
"""

from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.application.pipelines.analytics.product_analysis_pipeline import (
    ProductAnalysisPipeline,
)
from app.domain.schemas.price.price_history import PriceHistory, PriceHistoryCreate
from app.domain.schemas.products.product_mapping import ProductMapping


class MockCurrencyService:
    """Mock currency service for testing."""

    def __init__(self) -> None:
        self.rates = {"USD": 34.20, "EUR": 37.50, "GBP": 43.10, "TRY": 1.0}

    async def get_exchange_rates(self) -> Dict[str, float]:
        return self.rates

    async def convert_price(self, amount: float, currency: str) -> float:
        rate = self.rates.get(currency.upper(), 1.0)
        return amount * rate


class MockProductMappingRepository:
    """Mock ProductMappingRepository."""

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


class MockPriceHistoryRepository:
    """Mock PriceHistoryRepository."""

    def __init__(self) -> None:
        self.records: List[PriceHistory] = []
        self.next_id = 1

    async def create_bulk(
        self, *, items: List[PriceHistoryCreate], commit: bool = True
    ) -> List[PriceHistory]:
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
    """Mock UnitOfWork for integration testing."""

    def __init__(self) -> None:
        self.product_mappings = MockProductMappingRepository()
        self.price_histories = MockPriceHistoryRepository()
        self._committed = False

    async def __aenter__(self) -> "MockUnitOfWork":
        return self

    async def __aexit__(self, *args: Any) -> None:
        pass

    async def commit(self) -> None:
        self._committed = True

    async def rollback(self) -> None:
        pass


@pytest.fixture
def mock_uow() -> MockUnitOfWork:
    return MockUnitOfWork()


@pytest.fixture
def mock_currency_service() -> MockCurrencyService:
    return MockCurrencyService()


@pytest.fixture
def sample_raw_batch() -> List[Dict[str, Any]]:
    """Raw batch data as it would come from external provider."""
    return [
        {
            "id": "nike_001",
            "provider_id": 1,
            "external_product_code": "nike_001",
            "name": "Nike Air Max 90",
            "price": "$199.99",
            "currency": "USD",
            "in_stock": True,
            "stock_quantity": 50,
            "product_url": "https://nike.com/airmax90",
        },
        {
            "id": "adidas_002",
            "provider_id": 1,
            "external_product_code": "adidas_002",
            "name": "Adidas Ultraboost",
            "price": "189,00",
            "currency": "EUR",
            "in_stock": True,
            "stock_quantity": 30,
        },
        {
            "id": "puma_003",
            "provider_id": 2,
            "external_product_code": "puma_003",
            "name": "Puma RS-X",
            "price": 1500.50,
            "currency": "TRY",
            "in_stock": False,
            "stock_quantity": 0,
        },
    ]


class TestProductAnalysisPipelineIntegration:
    """Integration tests for the full pipeline flow."""

    @pytest.mark.asyncio
    async def test_full_pipeline_flow(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
        sample_raw_batch: List[Dict[str, Any]],
    ) -> None:
        """Test complete pipeline: normalize → mapping → save."""
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=sample_raw_batch)

        # Verify all products processed
        assert len(context.result) == 3

        # Verify mappings created
        assert mock_uow.product_mappings.next_id == 4  # 3 mappings created

        # Verify price histories saved
        assert len(mock_uow.price_histories.records) == 3

        # Verify meta information
        assert context.meta["total_products"] == 3
        assert context.meta["normalized_count"] == 3
        assert context.meta["mappings_processed"] == 3
        assert context.meta["saved_price_records"] == 3

    @pytest.mark.asyncio
    async def test_currency_conversion_in_pipeline(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
    ) -> None:
        """Test that currency conversion happens correctly in pipeline."""
        batch = [
            {
                "id": "test_001",
                "provider_id": 1,
                "price": "100.00",
                "currency": "USD",
            }
        ]
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=batch)

        result = context.result[0]
        assert result["price"] == 3420.0  # 100 * 34.20
        assert result["original_price"] == 100.0
        assert result["original_currency"] == "USD"
        assert result["currency"] == "TRY"

    @pytest.mark.asyncio
    async def test_pipeline_with_partial_failures(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
    ) -> None:
        """Test pipeline handles partial failures gracefully."""
        batch = [
            {"id": "valid_001", "provider_id": 1, "price": 100.0, "currency": "TRY"},
            {"id": "no_price"},  # Missing price - fails at normalize step
        ]
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=batch)

        # 1 product passes through completely, 1 fails at normalize
        assert context.meta["normalized_count"] == 1
        assert context.meta.get("error_count", 0) == 1 or len(context.errors) >= 1
        
        # Errors should be captured
        assert len(context.errors) >= 1

    @pytest.mark.asyncio
    async def test_pipeline_with_empty_batch(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
    ) -> None:
        """Test pipeline handles empty batch."""
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=[])

        assert context.errors  # Should have error about empty list
        assert mock_uow.product_mappings.next_id == 1  # No mappings created

    @pytest.mark.asyncio
    async def test_mapping_ids_assigned_correctly(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
    ) -> None:
        """Test that mapping IDs are correctly assigned to products."""
        batch = [
            {"id": "prod_1", "provider_id": 1, "price": 100.0, "currency": "TRY"},
            {"id": "prod_2", "provider_id": 1, "price": 200.0, "currency": "TRY"},
        ]
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=batch)

        assert context.result[0]["mapping_id"] == 1
        assert context.result[1]["mapping_id"] == 2

        # Verify price history records have correct mapping IDs
        assert mock_uow.price_histories.records[0].mapping_id == 1
        assert mock_uow.price_histories.records[1].mapping_id == 2

    @pytest.mark.asyncio
    async def test_price_history_values_correct(
        self,
        mock_uow: MockUnitOfWork,
        mock_currency_service: MockCurrencyService,
    ) -> None:
        """Test that price history records have correct values."""
        batch = [
            {
                "id": "test_001",
                "provider_id": 1,
                "price": "$50.00",
                "currency": "USD",
                "in_stock": True,
                "stock_quantity": 25,
            }
        ]
        pipeline = ProductAnalysisPipeline(mock_uow, mock_currency_service)  # type: ignore
        context = await pipeline.execute(data=batch)

        record = mock_uow.price_histories.records[0]
        assert float(record.price) == 1710.0  # 50 * 34.20
        assert float(record.original_price) == 50.0
        assert record.in_stock is True
        assert record.stock_quantity == 25
