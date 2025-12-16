# 🚀 User Service - Hackathon Microservice Template

Bu proje, takımın referans alacağı **Onion Architecture** tabanlı mikroservis şablonudur. Yeni servisler bu yapıya göre oluşturulmalıdır.

---

## 🏗️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Dil** | Python 3.12+ |
| **Web Framework** | FastAPI (Async) |
| **Paket Yöneticisi** | `uv` |
| **Auth** | JWT + RBAC |
| **Veritabanı** | PostgreSQL + SQLAlchemy 2.0 (Async) |
| **Cache & Broker** | Redis |
| **Background Jobs** | Celery |
| **Mimari** | Onion Architecture, CQRS, Pipeline Pattern, Unit of Work |

---

## 🛠️ Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
uv sync

# 2. Tüm ortamı başlat
docker compose up -d --build

# 3. Migrasyonları uygula
uv run alembic upgrade head

# 4. Testleri çalıştır
uv run pytest
```

**Yönetim Panelleri:**
- **API Docs:** http://localhost:8000/docs
- **Flower:** http://localhost:5555

---

## 📂 Proje Yapısı (Onion Architecture)

```
app/
├── api/                          # 🌐 API Layer (Dış Katman)
│   ├── v1/endpoints/             # Route handlers
│   └── deps.py                   # Dependencies (UoW, Auth, Cache)
│
├── application/                  # 🎯 Application Layer
│   ├── cqrs/
│   │   ├── commands/             # Write operations (Create, Update, Delete)
│   │   └── queries/              # Read operations (Get, List)
│   ├── pipelines/
│   │   ├── steps/                # Reusable business logic steps
│   │   └── user_pipeline.py      # Pipeline orchestrator
│   ├── services/                 # Application services (AuthService)
│   └── tasks/                    # Celery background tasks
│
├── domain/                       # 💎 Domain Layer (Çekirdek)
│   ├── i_repositories/           # Repository Interfaces (IBaseRepository, IUserRepository)
│   ├── i_services/               # Service Interfaces (ICacheService)
│   └── schemas/                  # Domain Entities (User, Role, UserCreate)
│
├── infrastructure/               # 🔧 Infrastructure Layer
│   ├── repositories/             # Concrete repository implementations
│   │   ├── base_repository.py    # BaseRepository (IBaseRepository impl)
│   │   ├── user_repository.py    # UserRepository
│   │   └── role_repository.py    # RoleRepository
│   └── unit_of_work.py           # UnitOfWork implementation
│
├── persistence/                  # 💾 Persistence Layer
│   ├── db/                       # Database connection, session
│   └── models/                   # SQLAlchemy ORM models
│
├── core/                         # ⚙️ Shared Kernel
│   ├── config/                   # Settings, Celery config
│   ├── security/                 # JWT, password hashing
│   ├── infrastructure/           # Cache, Logging implementations
│   ├── patterns/                 # Pipeline base class
│   └── web/                      # Middleware
│
tests/
├── unit/                         # Unit tests (mocked dependencies)
└── integration/                  # Integration tests (real DB)
```

---

## 🏛️ Onion Architecture Katmanları

```
                    ┌─────────────────────────────────────┐
                    │           API Layer                 │  ← HTTP/REST
                    │   (Endpoints, Dependencies)         │
                    └─────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │       Application Layer             │  ← Business Orchestration
                    │   (CQRS, Pipelines, Services)       │
                    └─────────────────────────────────────┘
                                    ↓
    ┌───────────────────────────────────────────────────────────────────┐
    │                        Domain Layer                               │  ← Core Business
    │     (Interfaces: IBaseRepository, IUserRepository, ICacheService) │
    │     (Entities: User, Role schemas)                                │
    │───────────────────────────────────────────────────────────────────│
    │  ⚠️ NO EXTERNAL DEPENDENCIES - Pure Python + Pydantic only        │
    └───────────────────────────────────────────────────────────────────┘
                                    ↑ implements
    ┌───────────────────────────────────────────────────────────────────┐
    │                   Infrastructure Layer                            │  ← Implementations
    │         (BaseRepository, UserRepository, UnitOfWork)              │
    └───────────────────────────────────────────────────────────────────┘
                                    ↑ uses
    ┌───────────────────────────────────────────────────────────────────┐
    │                    Persistence Layer                              │  ← ORM/DB
    │              (SQLAlchemy Models, DB Session)                      │
    └───────────────────────────────────────────────────────────────────┘
```

**🔑 Kritik Kural:** Domain katmanı HİÇBİR dış katmana bağımlı olmamalı!

---

## 🛤️ Yeni Feature Ekleme Workflow'u

Örnek: "Product" özelliği ekleme

### 1️⃣ Domain Layer - Schemas & Interfaces

```python
# app/domain/schemas/product.py
class ProductBase(BaseModel):
    name: str
    price: float

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True
```

```python
# app/domain/i_repositories/i_product_repository.py
class IProductRepository(IBaseRepository[Product, ProductCreate, ProductUpdate], ABC):
    @abstractmethod
    async def get_by_sku(self, sku: str) -> Optional[Product]:
        raise NotImplementedError
```

### 2️⃣ Persistence Layer - ORM Model

```python
# app/persistence/models/product.py
class Product(BaseEntity):
    __tablename__ = "products"
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
```

```bash
# Migration oluştur & uygula
uv run alembic revision --autogenerate -m "Add product table"
uv run alembic upgrade head
```

### 3️⃣ Infrastructure Layer - Repository

```python
# app/infrastructure/repositories/product_repository.py
class ProductRepository(BaseRepository, IProductRepository):
    orm_model = ProductModel
    schema_class = ProductSchema

    async def get_by_sku(self, sku: str) -> Optional[ProductSchema]:
        # Custom implementation
        pass
```

### 4️⃣ UnitOfWork'a Ekle

```python
# app/infrastructure/unit_of_work.py
@property
def products(self) -> ProductRepository:
    return ProductRepository(self.db)
```

### 5️⃣ Application Layer - CQRS & Pipeline

```python
# app/application/cqrs/commands/product_command.py
class ProductCommandService:
    async def create(self, product_in: ProductCreate) -> Product:
        async with self.uow:
            product = await self.uow.products.create(obj_in=product_in)
            await self.uow.commit()
            return product
```

### 6️⃣ API Layer - Endpoint

```python
# app/api/v1/endpoints/products.py
@router.post("/", response_model=Product)
async def create_product(
    product_in: ProductCreate,
    uow: IUnitOfWork = Depends(get_uow)
):
    service = ProductCommandService(uow)
    return await service.create(product_in)
```

---

## 🧪 Test Komutları

```bash
# Tüm testler
uv run pytest

# Sadece unit testler
uv run pytest tests/unit/

# Coverage raporu
uv run pytest --cov=app --cov-report=html
open htmlcov/index.html
```

---

## 🔧 Yararlı Komutlar

```bash
# Docker
docker compose up -d --build     # Start all
docker compose down -v           # Stop & remove volumes
docker logs hackathon_api        # View API logs

# Database
docker exec hackathon_db psql -U postgres -d hackathon_app -c "\dt"   # List tables
docker exec hackathon_db psql -U postgres -d hackathon_app -c "SELECT * FROM users;"

# Alembic
uv run alembic revision --autogenerate -m "Description"   # Create migration
uv run alembic upgrade head                               # Apply migrations
uv run alembic downgrade -1                               # Rollback last

# Linting & Formatting
uv run ruff check .              # Lint
uv run ruff format .             # Format
uv run mypy app/                 # Type check
```

---

## 📋 Checklist: Yeni Feature

- [ ] Domain schemas tanımlandı (`app/domain/schemas/`)
- [ ] Repository interface tanımlandı (`app/domain/i_repositories/`)
- [ ] ORM model oluşturuldu (`app/persistence/models/`)
- [ ] `app/persistence/models/__init__.py`'ye import eklendi
- [ ] Migration oluşturuldu ve uygulandı
- [ ] Repository implementation yazıldı (`app/infrastructure/repositories/`)
- [ ] UnitOfWork'a property eklendi
- [ ] CQRS Command/Query servisleri yazıldı
- [ ] API endpoint oluşturuldu
- [ ] Unit test yazıldı
- [ ] Integration test yazıldı

---

## 👥 Takım İçin Notlar

1. **ORM modelleri asla domain/application katmanlarına sızmamalı** - Sadece Schema döndür
2. **Repository metodları her zaman domain schema döndürmeli**
3. **Interface'ler `I` prefixi ile başlamalı** (IUserRepository, ICacheService)
4. **Commit, pre-commit hook'larından geçmeli** (ruff, mypy, pytest)
5. **Yeni model eklerken `app/persistence/models/__init__.py`'yi güncelle**
