import time
import uuid
import logging
from typing import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


logger = logging.getLogger("mocker")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.perf_counter()

        logger.info(f"[{request_id}] {request.method} {request.url.path}")

        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            logger.info(f"[{request_id}] {response.status_code} ({process_time:.4f}s)")
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as e:
            process_time = time.perf_counter() - start_time
            logger.error(f"[{request_id}] Error: {e} ({process_time:.4f}s)")
            raise
