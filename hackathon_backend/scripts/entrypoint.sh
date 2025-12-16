#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 Starting Application Setup"
echo "=========================================="

# Veritabanı bağlantısını bekle
echo "⏳ Waiting for database to be ready..."
while ! python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config.settings import get_settings

async def check_db():
    settings = get_settings()
    engine = create_async_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    async with engine.connect() as conn:
        await conn.execute('SELECT 1')
    await engine.dispose()

asyncio.run(check_db())
" 2>/dev/null; do
    echo "  Database not ready, waiting 2 seconds..."
    sleep 2
done
echo "✅ Database is ready!"

# Alembic migration çalıştır
echo ""
echo "🔄 Running database migrations..."
alembic upgrade head
echo "✅ Migrations completed!"

# Uygulamayı başlat
echo ""
echo "=========================================="
echo "  🎉 Starting FastAPI Application"
echo "=========================================="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
