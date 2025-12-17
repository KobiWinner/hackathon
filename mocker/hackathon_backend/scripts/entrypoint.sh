#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 Starting Mocker API (Stateless)"
echo "=========================================="

# Uygulamayı başlat
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
