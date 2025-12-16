import time
import uuid
from typing import Awaitable, Callable

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        # 1. Request ID Üret (veya header'dan al)
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # 2. Structlog Context'ine ID'yi temizle ve ekle
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        logger = structlog.get_logger()
        start_time = time.perf_counter()

        # 3. İsteği İşle (Başlangıç Logu)
        logger.info(
            "request_started",
            path=request.url.path,
            method=request.method,
            ip=request.client.host if request.client else "unknown",
        )

        try:
            response = await call_next(request)

            # 4. Yanıt İşle (Bitiş Logu)
            process_time = time.perf_counter() - start_time
            logger.info(
                "request_finished",
                status_code=response.status_code,
                process_time=f"{process_time:.4f}s",
            )

            # Response Header'a da ID'yi ekle (Frontend görsün)
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as e:
            # 5. Hata Durumu
            process_time = time.perf_counter() - start_time
            logger.error(
                "request_failed", error=str(e), process_time=f"{process_time:.4f}s"
            )
            raise
