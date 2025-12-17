from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config.settings import settings
from app.core.infrastructure.cache import cache
from app.core.infrastructure.logging import setup_logging
from app.core.web.middleware import RequestLoggerMiddleware
from app.domain.schemas.common import HealthCheck


# Lifespan context manager (Startup ve Shutdown olayları için modern yöntem)
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # 1. Startup: Logging sistemini kur
    # Bu sayede uygulama başlar başlamaz JSON logları akmaya başlar.
    setup_logging()

    yield

    # 2. Shutdown: Redis bağlantısını temizle
    await cache.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# 3. CORS Middleware
# Frontend ile iletişim için gerekli ayarlar
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,  # İzin verilen origin'ler
    allow_credentials=True,  # Cookie gönderimi için
    allow_methods=["*"],  # Tüm HTTP metodları (GET, POST, PUT, DELETE, vb.)
    allow_headers=["*"],  # Tüm header'lar
)

# 4. Request Logger Middleware
# Her isteği yakalayıp loglayan ve request_id atayan katman
app.add_middleware(RequestLoggerMiddleware)

# Tüm API rotalarını uygulamaya ekliyoruz
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", response_model=HealthCheck)
async def root() -> HealthCheck:
    return HealthCheck(
        status="ok",
        project_name=settings.PROJECT_NAME,
        mode="debug" if settings.DEBUG else "production",
    )
