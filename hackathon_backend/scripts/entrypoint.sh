#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 Starting Application Setup"
echo "=========================================="

# Veritabanı bağlantısını bekle (basit TCP kontrolü)
echo "⏳ Waiting for database to be ready..."
while ! python -c "
import socket
import os

host = os.environ.get('POSTGRES_SERVER', 'db')
port = int(os.environ.get('POSTGRES_PORT', 5432))

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(2)
result = sock.connect_ex((host, port))
sock.close()
exit(0 if result == 0 else 1)
" 2>/dev/null; do
    echo "  Database not ready, waiting 2 seconds..."
    sleep 2
done

# Ekstra bekleme - PostgreSQL'in tam hazır olması için
sleep 3
echo "✅ Database is ready!"

# Alembic migration oluştur (sadece development'ta)
echo ""
if [ "$AUTO_GENERATE_MIGRATIONS" = "true" ]; then
    echo "🔄 Generating new migrations (development mode)..."
    alembic revision --autogenerate -m "auto_migration_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || echo "  ℹ️  No new migrations needed or already up to date"
else
    echo "ℹ️  Skipping auto-generate (production mode). Set AUTO_GENERATE_MIGRATIONS=true to enable."
fi

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
