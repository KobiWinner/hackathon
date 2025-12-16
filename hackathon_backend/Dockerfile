# --- AŞAMA 1: Builder (Derleme) ---
# Uv yüklü gelen özel imajı kullanıyoruz, hızlıca requirements oluşturacağız
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim as builder

# Çalışma dizini
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY pyproject.toml uv.lock ./

# uv ile requirements.txt dosyasını oluştur
RUN uv export --format requirements-txt --no-hashes --output-file requirements.txt

# --- AŞAMA 2: Runner (Çalıştırma) ---

FROM python:3.12-slim

WORKDIR /app

# Ortam değişkenleri (Python'ın tampon belleğe almasını engeller)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Builder aşamasından sadece requirements dosyasını al
COPY --from=builder /app/requirements.txt .

# Bağımlılıkları kur (--no-cache-dir ile boyutu küçültüyoruz)
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Entrypoint script'ini çalıştırılabilir yap
RUN chmod +x /app/scripts/entrypoint.sh

# Konteynerin dışarıya açacağı port
EXPOSE 8000

# Entrypoint script ile başlat (migration + uvicorn)
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
