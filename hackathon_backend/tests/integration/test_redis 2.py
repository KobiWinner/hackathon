import pytest

from app.core.infrastructure.cache import cache


@pytest.mark.asyncio
async def test_redis_connection_and_operations() -> None:
    """
    Integration Test: Gerçek Redis sunucusu ile yazma/okuma/silme testi.
    """
    key = "integration_test_key"
    value = {"status": "working", "speed": "fast"}

    try:
        # 1. Yazma (SET)
        await cache.set(key, value, expire=10)

        # 2. Okuma (GET)
        result = await cache.get(key)
        assert result is not None
        assert result["status"] == "working"
        assert result == value

        # 3. Silme (DELETE)
        await cache.delete(key)

        # 4. Silindiğini Doğrulama
        deleted_result = await cache.get(key)
        assert deleted_result is None

    except ConnectionError:
        pytest.fail("Redis bağlantısı kurulamadı! Docker ayakta mı?")
