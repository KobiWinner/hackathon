# 🏗 Backend Mimari

FastAPI + Clean Architecture + CQRS pattern ile geliştirilmiş Python backend.

---

## 📁 Genel Yapı

```
hackathon_backend/
├── app/                    # Ana uygulama kodu
├── alembic/                # Database migrations
├── tests/                  # Test dosyaları
├── scripts/                # Utility scriptler
├── postman/                # Postman koleksiyonları
├── Dockerfile              # Docker image
├── docker-compose.yml      # Local development
├── pyproject.toml          # Dependencies (uv)
└── alembic.ini             # Migration config
```

---

## 📁 App Klasör Yapısı

```
app/
├── main.py                 # FastAPI application entry point
│
├── api/                    # 🌐 API Layer (Controllers)
│   ├── deps.py             # Dependency injection
│   └── v1/
│       ├── __init__.py     # Router aggregation
│       └── endpoints/      # Route handlers
│           ├── auth.py
│           ├── items.py
│           ├── products.py
│           ├── categories.py
│           ├── chat.py
│           └── ...
│
├── application/            # 💼 Application Layer (Use Cases)
│   ├── cqrs/               # Command Query Responsibility Segregation
│   │   ├── commands/       # Write operations
│   │   │   ├── item_command.py
│   │   │   └── ...
│   │   └── queries/        # Read operations
│   │       ├── product_query.py
│   │       └── ...
│   ├── pipelines/          # Business logic pipelines
│   │   └── ...
│   ├── services/           # Application services
│   │   ├── product_search_service.py
│   │   └── ...
│   └── tasks/              # Celery background tasks
│       └── ...
│
├── core/                   # ⚙️ Core Layer (Cross-cutting concerns)
│   ├── config/             # App configuration
│   │   ├── settings.py     # Environment settings
│   │   └── celery.py       # Celery config
│   ├── security/           # Auth & JWT
│   ├── exceptions.py       # Custom exceptions
│   ├── patterns/           # Design patterns
│   ├── infrastructure/     # Core infrastructure
│   └── web/                # Web utilities
│
├── domain/                 # 📦 Domain Layer (Business Rules)
│   ├── i_repositories/     # Repository interfaces
│   │   ├── i_product_repository.py
│   │   ├── i_user_repository.py
│   │   └── ...
│   ├── i_services/         # Service interfaces
│   │   └── ...
│   └── schemas/            # Pydantic DTOs
│       ├── products/
│       ├── providers/
│       ├── users/
│       └── ...
│
├── infrastructure/         # 🔧 Infrastructure Layer
│   ├── unit_of_work.py     # Unit of Work pattern
│   ├── mocker_client.py    # External API client
│   └── repositories/       # Repository implementations
│       ├── product_repository.py
│       ├── user_repository.py
│       └── ...
│
└── persistence/            # 💾 Persistence Layer
    ├── db/                 # Database connection
    │   ├── session.py      # SQLAlchemy session
    │   └── base.py         # Base model
    └── models/             # SQLAlchemy ORM models
        ├── user.py
        ├── role.py
        ├── products/
        │   ├── product.py
        │   ├── category.py
        │   └── ...
        ├── price/
        ├── providers/
        ├── analytics/
        └── chat/
```

---

## 🔄 Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  (FastAPI Routes - api/v1/endpoints/)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Commands   │  │   Queries    │  │   Services   │          │
│  │   (Write)    │  │   (Read)     │  │  (Business)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                        CQRS Pattern                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                               │
│  ┌──────────────────────┐  ┌───────────────────────┐           │
│  │  Repository Interfaces│  │   Schemas (DTOs)      │           │
│  │  (i_repositories/)    │  │   (Pydantic)          │           │
│  └──────────────────────┘  └───────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                           │
│  ┌──────────────────────┐  ┌───────────────────────┐           │
│  │  Repository Impl.    │  │   Unit of Work        │           │
│  │  (repositories/)     │  │                       │           │
│  └──────────────────────┘  └───────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Persistence Layer                             │
│  ┌──────────────────────┐  ┌───────────────────────┐           │
│  │  SQLAlchemy Models   │  │   Database Session    │           │
│  │  (models/)           │  │   (PostgreSQL)        │           │
│  └──────────────────────┘  └───────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Katman Açıklamaları

### 1. API Layer (`/api`)
REST endpoint'leri. HTTP request/response işleme.

### 2. Application Layer (`/application`)
Use case'ler ve iş mantığı. CQRS pattern ile command/query ayrımı.

### 3. Domain Layer (`/domain`)
- **i_repositories/**: Repository interface'leri (abstract)
- **i_services/**: Service interface'leri
- **schemas/**: Pydantic DTO'ları

### 4. Infrastructure Layer (`/infrastructure`)
- Domain interface'lerinin implementasyonları
- Unit of Work pattern
- External service client'ları

### 5. Persistence Layer (`/persistence`)
- SQLAlchemy ORM modelleri
- Database session yönetimi

### 6. Core Layer (`/core`)
- Configuration
- Security (JWT, Auth)
- Cross-cutting concerns

---

## 🗄 Database Models

```
models/
├── user.py              # User model
├── role.py              # Role model
├── base_entity.py       # Base model with timestamps
│
├── products/            # Ürün modelleri
│   ├── product.py       # Product
│   ├── category.py      # Category
│   ├── brand.py         # Brand
│   └── ...
│
├── price/               # Fiyat modelleri
│   ├── price.py         # Price
│   ├── price_history.py # Price history
│   └── ...
│
├── providers/           # Sağlayıcı modelleri
│   ├── provider.py      # Provider
│   └── ...
│
├── analytics/           # Analitik modelleri
│   └── ...
│
└── chat/                # Chat modelleri
    └── ...
```

---

## 🔧 Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Migration | Alembic |
| Task Queue | Celery + Redis |
| Auth | JWT (python-jose) |
| Validation | Pydantic v2 |
| Package Manager | uv |

---

## 📝 Konvansiyonlar

### Dosya İsimlendirme
- **Models:** snake_case (`product.py`)
- **Schemas:** snake_case (`product_search.py`)
- **Interfaces:** `i_` prefix (`i_product_repository.py`)

### Import Sırası
1. Standard library
2. Third party (fastapi, sqlalchemy, pydantic)
3. Local imports
