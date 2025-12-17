# Basit Python imajı
FROM python:3.12-slim

WORKDIR /app

# Ortam değişkenleri
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Bağımlılık dosyasını kopyala
COPY pyproject.toml ./

# pip ile bağımlılıkları kur
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi pydantic-settings "uvicorn[standard]" faker

# Uygulama kodunu kopyala
COPY . .

# Entrypoint script'ini çalıştırılabilir yap
RUN chmod +x /app/scripts/entrypoint.sh

# Konteynerin dışarıya açacağı port
EXPOSE 8000

# Entrypoint script ile başlat
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
