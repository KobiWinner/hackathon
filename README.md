# 🏆 Hackathon Project - Price Comparison Platform

Fiyat karşılaştırma platformu için full-stack monorepo projesi. Backend (FastAPI) ve Frontend (Next.js) uygulamalarını içerir.

---

## 🎯 Proje Özeti

Kullanıcıların farklı e-ticaret sitelerinden ürün fiyatlarını karşılaştırmasını sağlayan bir platform. Elasticsearch ile hızlı arama, kategori bazlı ürün listeleme, fiyat takibi ve AI destekli chat özellikleri içerir.

---

## 🏗️ Teknoloji Yığını

### Backend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Python | 3.12+ | Ana dil |
| FastAPI | Latest | Web framework (async) |
| SQLAlchemy | 2.0 | ORM (async) |
| PostgreSQL | 16 | Ana veritabanı |
| Redis | 7 | Cache & message broker |
| Celery | Latest | Background tasks |
| Elasticsearch | 8.x | Full-text search |
| Alembic | Latest | Database migrations |
| JWT | - | Authentication |

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 16.0 | React framework |
| React | 19.2 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Axios | 1.13 | HTTP client |
| Playwright | 1.57 | E2E testing |
| Jest | 30.x | Unit testing |

---

## 📂 Proje Yapısı

```
hackathon/
├── hackathon_backend/          # 🐍 FastAPI Backend
│   ├── app/
│   │   ├── api/                # REST API endpoints
│   │   ├── application/        # Business logic (CQRS, Services)
│   │   ├── core/               # Config, security, shared utilities
│   │   ├── domain/             # Domain entities, interfaces
│   │   ├── infrastructure/     # Repository implementations
│   │   └── persistence/        # ORM models, database
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Unit & integration tests
│   └── Dockerfile
│
├── hackathon_frontend/         # ⚛️ Next.js Frontend
│   ├── src/
│   │   ├── api/                # API services (Axios)
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layout/             # Layout components
│   │   └── lib/                # Utility functions
│   ├── tests/                  # Unit & E2E tests
│   └── Dockerfile
│
├── docker-compose.yml          # 🐳 Full stack orchestration
└── README.md                   # Bu dosya
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker & Docker Compose
- Node.js 20+ (frontend geliştirme için)
- Python 3.12+ & `uv` (backend geliştirme için)

### Docker ile Başlatma (Önerilen)

```bash
# Tüm servisleri başlat
docker-compose up -d --build

# Logları izle
docker-compose logs -f
```

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Flower (Celery) | http://localhost:5555 |
| Redis Insight | http://localhost:5540 |
| Dozzle (Logs) | http://localhost:8888 |

### Local Geliştirme

**Backend:**
```bash
cd hackathon_backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd hackathon_frontend
npm install
npm run dev
```

---

## 🏛️ Backend Mimarisi

Backend, **Onion Architecture** (Clean Architecture) prensiplerine göre tasarlanmıştır.

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│              (Endpoints, Dependencies)                      │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                         │
│           (CQRS Commands/Queries, Services)                 │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                             │
│      (Interfaces, Schemas - NO external dependencies)       │
├─────────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                        │
│         (Repository implementations, UnitOfWork)            │
├─────────────────────────────────────────────────────────────┤
│                  Persistence Layer                          │
│              (SQLAlchemy ORM models, DB)                    │
└─────────────────────────────────────────────────────────────┘
```

### Katmanlar ve Sorumlulukları

| Katman | Konum | Sorumluluk |
|--------|-------|------------|
| **API** | `app/api/` | HTTP endpoints, dependency injection |
| **Application** | `app/application/` | CQRS, pipelines, business services |
| **Domain** | `app/domain/` | Interfaces, Pydantic schemas |
| **Infrastructure** | `app/infrastructure/` | Repository implementations |
| **Persistence** | `app/persistence/` | SQLAlchemy models, DB session |
| **Core** | `app/core/` | Config, security, logging, cache |

### API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/auth/login` | Kullanıcı girişi |
| POST | `/api/v1/auth/register` | Kullanıcı kaydı |
| GET | `/api/v1/categories/` | Tüm kategoriler |
| GET | `/api/v1/categories/tree` | Kategori ağacı |
| GET | `/api/v1/categories/{slug}` | Kategori + ürünler |
| GET | `/api/v1/search?q=...` | Elasticsearch ürün arama |
| POST | `/api/v1/chat/message` | AI chat mesajı |

### Backend Test Yapısı

Backend testleri `tests/` klasöründe organize edilmiştir:

```
tests/
├── conftest.py              # Pytest fixtures (DB, Redis, API client)
├── factories.py             # Test data factories
│
├── unit/                    # 🧪 Unit Tests (izole, mock'lu)
│   ├── test_cache.py        # Cache service testleri
│   ├── test_chat_schemas.py # Schema validasyon testleri
│   ├── test_normalize_currency_step.py
│   ├── test_profit_margin_step.py
│   ├── test_save_price_history_step.py
│   ├── test_trend_analysis_step.py
│   └── test_user_command.py # CQRS command testleri
│
├── integration/             # 🔗 Integration Tests (gerçek DB)
│   ├── test_auth_routes.py  # Auth API endpoint testleri
│   ├── test_chat_api.py     # Chat API testleri
│   ├── test_logging.py      # Logging middleware testleri
│   ├── test_product_analysis_pipeline.py
│   ├── test_redis.py        # Redis bağlantı testleri
│   └── test_uow.py          # Unit of Work testleri
│
├── e2e/                     # 🌐 End-to-End Tests
│   └── v1/                  # API version 1 E2E testleri
│
├── load/                    # 📊 Load/Performance Tests
│   └── ...
│
└── utils/                   # 🔧 Test utilities
    └── ...
```

#### Test Fixtures (`conftest.py`)

| Fixture | Scope | Açıklama |
|---------|-------|----------|
| `engine` | function | Test DB engine, her testte tablo reset |
| `db_session` | function | Async SQLAlchemy session |
| `client` | function | HTTPX AsyncClient (API test) |
| `patch_redis_connection` | function | Redis mock/gerçek bağlantı |

#### Test Komutları

```bash
# Tüm testler
uv run pytest

# Sadece unit testler
uv run pytest tests/unit/

# Sadece integration testler
uv run pytest tests/integration/

# Belirli test dosyası
uv run pytest tests/unit/test_cache.py -v

# Coverage raporu
uv run pytest --cov=app --cov-report=html
open htmlcov/index.html
```

## ⚛️ Frontend Mimarisi

Frontend, **Next.js App Router** ile modüler yapıda tasarlanmıştır.

### Klasör Yapısı

```
src/
├── api/                    # API servisleri
│   ├── auth/               # Authentication
│   ├── categories/         # Kategori API
│   ├── search/             # Arama API
│   ├── httpClient.ts       # Axios instance
│   └── interceptors.ts     # Request/response interceptors
│
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, register)
│   ├── (site)/             # Main site routes
│   │   ├── category/[slug]/ # Kategori sayfası
│   │   ├── product/[id]/   # Ürün detay
│   │   └── search/         # Arama sonuçları
│   └── layout.tsx          # Root layout
│
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── buttons/        # Button variants
│   │   ├── feedback/       # Skeleton, Toast, etc.
│   │   └── typography/     # Text, Heading
│   ├── header/             # Header, SearchBar
│   └── home/               # Homepage components
│
├── hooks/                  # Custom React hooks
│   ├── useSearch.ts        # Search logic
│   ├── useAsync.ts         # Async state management
│   └── useDropdown.ts      # Dropdown logic
│
└── layout/                 # Layout components
    └── site/               # Site-wide layout
```

### Önemli Hooks

| Hook | Kullanım |
|------|----------|
| `useSearch` | Arama state yönetimi |
| `useAsync` | API call state wrapper |
| `useDropdown` | Dropdown toggle logic |
| `usePagination` | Pagination state |
| `useElasticSearch` | Elasticsearch entegrasyonu |

---

## 📊 Veritabanı Şeması

### Ana Tablolar

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │     roles       │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ email           │     │ name            │
│ hashed_password │     │ description     │
│ first_name      │     └─────────────────┘
│ last_name       │            │
│ is_active       │            │ M:N
└─────────────────┘            │
                               │
┌─────────────────┐     ┌─────────────────┐
│   categories    │     │    products     │
├─────────────────┤     ├─────────────────┤
│ id              │◄────│ category_id     │
│ name            │     │ id              │
│ slug            │     │ name            │
│ parent_id (FK)  │     │ slug            │
└─────────────────┘     │ brand           │
                        │ description     │
                        │ image_url       │
                        └─────────────────┘
                               │
                               │ 1:N
                               ▼
                        ┌─────────────────┐
                        │product_variants │
                        ├─────────────────┤
                        │ id              │
                        │ product_id (FK) │
                        │ color           │
                        │ size            │
                        └─────────────────┘
                               │
                               │ 1:N
                               ▼
                        ┌─────────────────┐
                        │ price_history   │
                        ├─────────────────┤
                        │ variant_id (FK) │
                        │ provider_id     │
                        │ price           │
                        │ currency        │
                        │ timestamp       │
                        └─────────────────┘
```

---

## 🧪 Test Komutları

### Backend
```bash
cd hackathon_backend

# Tüm testler
uv run pytest

# Coverage
uv run pytest --cov=app --cov-report=html

# Type checking
uv run mypy app/
```

### Frontend
```bash
cd hackathon_frontend

# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🐳 Docker Servisleri

| Servis | Container | Port | Açıklama |
|--------|-----------|------|----------|
| Frontend | hackathon_frontend | 3000 | Next.js SSR |
| Backend | hackathon_api | 8000 | FastAPI |
| PostgreSQL | hackathon_db | 5432 | Ana veritabanı |
| Redis | hackathon_redis | 6379 | Cache & broker |
| Celery Worker | hackathon_worker | - | Background tasks |
| Flower | hackathon_flower | 5555 | Celery UI |
| Redis Insight | hackathon_redis_ui | 5540 | Redis UI |
| Dozzle | hackathon_dozzle | 8888 | Log viewer |

---

## 🔧 Yararlı Komutlar

```bash
# Docker
docker-compose up -d              # Start all
docker-compose down -v            # Stop & clean
docker logs hackathon_api -f      # View API logs

# Database
docker exec hackathon_db psql -U postgres -d postgres -c "\dt"

# Migrations
cd hackathon_backend
uv run alembic upgrade head       # Apply migrations
uv run alembic revision --autogenerate -m "description"
```

---

## 📋 Yeni Feature Ekleme

1. **Backend:** Domain → Persistence → Infrastructure → Application → API
2. **Frontend:** API Types → API Service → Page/Component → Hook (isteğe bağlı)

Detaylı workflow için: [Backend README](./hackathon_backend/README.md)

---

## 👥 Takım Kuralları

- ✅ Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) formatında
- ✅ PR açmadan önce `lint` ve `test` geçmeli
- ✅ Backend'de ORM modelleri domain katmanına sızmamalı
- ✅ Frontend'de API çağrıları `src/api/` altında toplanmalı
- ✅ Yeni component eklerken UI library stilini takip et

---

## 📄 Lisans

Bu proje Hackathon amaçlı geliştirilmiştir.
