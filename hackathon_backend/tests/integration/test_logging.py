import json
import logging
from typing import AsyncGenerator, Generator

import pytest
import structlog
from httpx import ASGITransport, AsyncClient

from app.core.config.settings import settings
from app.main import app


@pytest.fixture(autouse=True)
def configure_structlog_for_testing() -> Generator[None, None, None]:
    """
    Testler çalışmadan önce Structlog'u JSON formatına zorla.
    Bu fixture her testten önce otomatik çalışır (autouse=True).
    """
    # 1. Ayarı JSON'a çek
    settings.LOG_JSON_FORMAT = True

    # 2. Structlog'u sıfırla ve yeniden kur (Force Reconfigure)
    structlog.reset_defaults()

    # Kendi setup fonksiyonumuzu manuel çağırıyoruz
    # Ama önce mevcut handler'ları temizleyelim ki loglar dublike olmasın
    root = logging.getLogger()
    if root.handlers:
        for handler in root.handlers:
            root.removeHandler(handler)

    from app.core.infrastructure.logging import setup_logging

    setup_logging()

    yield


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Asenkron Client Fixture.
    Lifespan olaylarını (Redis connect/disconnect) doğru event loop içinde yönetir.
    """
    # ASGITransport, FastAPI lifespan'ini otomatik tetikler
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_request_id_header_generation(client: AsyncClient) -> None:
    """
    Test: Middleware her isteğe benzersiz bir X-Request-ID ekliyor mu?
    """
    response = await client.get("/")
    assert response.status_code == 200

    # Header kontrolü
    assert "x-request-id" in response.headers
    request_id = response.headers["x-request-id"]
    assert len(request_id) > 0


@pytest.mark.asyncio
async def test_json_logging_structure(
    client: AsyncClient, caplog: pytest.LogCaptureFixture
) -> None:
    """
    Test: Loglar JSON formatında ve doğru yapıda üretiliyor mu?
    NOT: caplog, logging modülü üzerinden geçen kayıtları yakalar.
    """
    # Caplog seviyesini INFO yapıyoruz ki logları görebilsin
    caplog.set_level(logging.INFO)

    # 1. İsteği at
    response = await client.get("/")
    assert response.status_code == 200

    # 2. Yakalanan log kayıtlarını incele
    json_logs = []
    for record in caplog.records:
        try:
            log_entry = json.loads(record.message)
            json_logs.append(log_entry)
        except (json.JSONDecodeError, TypeError):
            continue

    assert len(json_logs) > 0, "Hiçbir geçerli JSON logu yakalanamadı!"

    # 3. İçerik Kontrolü
    request_id_header = response.headers["x-request-id"]
    found_request_log = False

    for log in json_logs:
        # Middleware logunu bul
        if log.get("event") == "request_finished":
            found_request_log = True

            # Correlation ID kontrolü
            assert log.get("request_id") == request_id_header
            assert log.get("status_code") == 200
            assert "process_time" in log
            break

    assert found_request_log, "request_finished logu bulunamadı!"


@pytest.mark.asyncio
async def test_custom_request_id_propagation(
    client: AsyncClient, caplog: pytest.LogCaptureFixture
) -> None:
    """
    Test: İstemci kendi ID'sini gönderirse sistem onu kullanıyor mu?
    """
    caplog.set_level(logging.INFO)
    custom_id = "benim-ozel-takip-kodum-123"

    response = await client.get("/", headers={"X-Request-ID": custom_id})

    # 1. Header kontrolü
    assert response.headers["x-request-id"] == custom_id

    # 2. Log kontrolü
    found_in_logs = False
    for record in caplog.records:
        if custom_id in record.message:
            found_in_logs = True
            break

    assert found_in_logs, f"Custom ID ({custom_id}) loglarda bulunamadı!"
