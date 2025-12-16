from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config.settings import settings

# Motoru (Engine) Başlatıyoruz
# echo=True ise terminalde SQL sorgularını görürsün (Debug için harika)
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=settings.DEBUG,
    future=True,
)

# Session Fabrikası
# Veritabanı işlemleri için 'Session' nesneleri üretecek.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# Dependency Injection (Bağımlılık Enjeksiyonu)
# API Endpoint'lerinde "db: AsyncSession = Depends(get_db)" diyerek kullanacağız.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Hata olmazsa otomatik commit yapılabilir (tercihe bağlı)
        except Exception:
            await session.rollback()  # Hata olursa işlemi geri al
            raise
        finally:
            await session.close()  # Bağlantıyı havuza iade et
