import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Tüm model'leri otomatik import et - yeni model eklendiğinde burası değişmez
import app.persistence.models  # noqa: F401
from alembic import context

# Kendi proje ayarlarımızı import ediyoruz
from app.core.config.settings import settings
from app.persistence.db.base import Base

config = context.config

# Log ayarları
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata hedefi (Base sınıfımız)
target_metadata = Base.metadata

# Veritabanı URL'ini settings'den alıp Alembic config'e yazıyoruz
# .env dosyasındaki veya ortam değişkenlerindeki URL'i kullanır.
config.set_main_option("sqlalchemy.url", str(settings.SQLALCHEMY_DATABASE_URI))


def run_migrations_offline() -> None:
    """Veritabanına bağlanmadan SQL scripti oluşturur."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Veritabanına bağlanıp migrasyonları çalıştırır."""
    # Asenkron motoru oluştururken config'den URL'i alıyoruz
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
