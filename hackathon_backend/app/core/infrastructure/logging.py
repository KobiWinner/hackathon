import logging
import sys
from typing import Any

import structlog
from structlog.types import Processor

from app.core.config.settings import settings


def setup_logging() -> Any:
    """
    Loglama altyapısını kurar.
    Standart logging ve structlog'u JSON formatında birleştirir.
    """
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,  # Context'ten (request_id) veri al
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    # 1. Structlog Konfigürasyonu
    structlog.configure(
        processors=shared_processors
        + [
            structlog.processors.JSONRenderer()
            if settings.LOG_JSON_FORMAT
            else structlog.dev.ConsoleRenderer()
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # 2. Standart Logging (Uvicorn, SQLAlchemy vb.) Ayarı
    # Bu kütüphanelerin loglarını da yakalayıp JSON'a çevirmemiz lazım.
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.processors.JSONRenderer()
            if settings.LOG_JSON_FORMAT
            else structlog.dev.ConsoleRenderer(),
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(settings.LOG_LEVEL.upper())

    # Uvicorn loglarını eziyoruz ki çift log basmasın
    for _log in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        logging.getLogger(_log).handlers.clear()
        logging.getLogger(_log).propagate = True

    # Kendi loglarımızı tanımlıyoruz
    return structlog.get_logger()



def get_logger() -> Any:
    return structlog.get_logger()

# Global logger instance
logger = structlog.get_logger()
