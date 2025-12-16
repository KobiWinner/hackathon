import json

import pytest
from pytest_mock import MockerFixture

from app.core.infrastructure.cache import cache


@pytest.mark.asyncio
async def test_cache_set_logic(mocker: MockerFixture) -> None:
    """
    Unit Test: Cache servisi veriyi JSON'a çevirip kaydediyor mu?
    (Gerçek Redis'e gitmez, Mock kullanılır)
    """
    # 1. Redis client'ını taklit et (Mock)
    # AsyncMock kullanıyoruz çünkü redis metodları async (await)
    mock_redis = mocker.AsyncMock()

    # Cache servisindeki gerçek redis client'ı yerine bu kuklayı koyuyoruz
    mocker.patch.object(cache, "redis", mock_redis)

    # 2. Test verisi
    key = "test_key"
    data = {"id": 1, "name": "Hackathon"}

    # 3. Eylem (Servisi çağır)
    await cache.set(key, data, expire=60)

    # 4. Kontrol (Assert)
    # Redis'in set komutu çağrıldı mı?
    # Parametre olarak giden veri JSON string'e çevrilmiş mi?
    mock_redis.set.assert_called_once_with(key, json.dumps(data), ex=60)


@pytest.mark.asyncio
async def test_cache_get_logic(mocker: MockerFixture) -> None:
    """
    Unit Test: Cache servisi gelen JSON string'i Python objesine çeviriyor mu?
    """
    mock_redis = mocker.AsyncMock()
    mocker.patch.object(cache, "redis", mock_redis)

    # Senaryo: Redis'ten string (JSON) dönüyor
    mock_redis.get.return_value = '{"id": 1, "name": "Hackathon"}'

    # Eylem
    result = await cache.get("test_key")

    # Kontrol
    assert result == {"id": 1, "name": "Hackathon"}
    assert isinstance(result, dict)  # String değil dict olmalı
