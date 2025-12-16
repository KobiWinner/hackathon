from typing import List

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # .env dosyasındaki değişkenlerle birebir aynı isimde olmalı
    PROJECT_NAME: str
    API_V1_STR: str
    SECRET_KEY: str
    DEBUG: bool = False
    # --- Veritabanı Ayarları ---
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    # --- Redis Ayarları ---
    # DB 0: Cache
    # DB 1: Broker (Kuyruk)
    # DB 2: Result Backend
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    # --- JWT Ayarları ---
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token geçerlilik süresi (dakika)
    # --- Logging Ayarları ---
    LOG_LEVEL: str = "INFO"
    LOG_JSON_FORMAT: bool = True
    # --- CORS Ayarları ---
    # Virgülle ayrılmış origin listesi (örn: "http://localhost:3000,http://example.com")
    # Boş bırakılırsa varsayılan olarak localhost:3000 kullanılır
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    # --- EXCHANGE RATE API ---
    EXCHANGE_RATE_API: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """CORS_ORIGINS string'ini listeye çevirir."""
        if not self.CORS_ORIGINS:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    # Pydantic v2 Konfigürasyonu
    model_config = SettingsConfigDict(
        env_file=".env",  # .env dosyasını oku
        env_ignore_empty=True,  # Boş değer varsa patlama
        extra="ignore",  # .env'de tanımlı ama burada yoksa görmezden gel
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()  # type: ignore
