# 🏗 Frontend Mimari

Bu doküman, frontend projesinin mimari yapısını ve klasör organizasyonunu açıklar.

---

## 📁 Klasör Yapısı

```
src/
├── api/              # API Layer
│   ├── httpClient.ts      # Axios instance
│   ├── interceptors.ts    # Request/Response interceptors
│   ├── createService.ts   # Generic CRUD service factory
│   ├── types.ts           # API tip tanımları
│   ├── auth/              # Auth API
│   ├── categories/        # Kategori API
│   ├── items/             # Ürün API
│   └── search/            # Arama API
│
├── app/              # Next.js App Router
│   ├── (site)/            # Site route grubu
│   │   ├── page.tsx       # Ana sayfa (/)
│   │   └── product/       # Ürün sayfaları
│   ├── globals.css        # Global stiller
│   └── layout.tsx         # Root layout
│
├── components/       # React Bileşenleri
│   ├── ui/                # Temel UI bileşenleri
│   ├── home/              # Ana sayfa bileşenleri
│   ├── product/           # Ürün bileşenleri
│   └── header/            # Header bileşenleri
│
├── hooks/            # Custom React Hooks
│   ├── useAsync.ts        # Async işlemler
│   ├── useSearch.ts       # Arama hook
│   ├── useElasticSearch.ts # Elasticsearch entegrasyonu
│   └── ...
│
├── config/           # Konfigürasyon
├── constants/        # Sabit Değerler
├── context/          # React Context
├── data/             # Mock Data
├── layout/           # Layout Bileşenleri
├── lib/              # Utility Fonksiyonlar
└── theme/            # Tema Ayarları
```

---

## 🔄 Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Component │ ──▶ │    Hook      │ ──▶ │  API Layer  │
│  (UI State) │     │ (Business)   │     │  (HTTP)     │
└─────────────┘     └──────────────┘     └─────────────┘
      ▲                    │                    │
      │                    │                    ▼
      │              ┌─────▼─────┐        ┌─────────────┐
      └────────────── │  Context  │        │   Backend   │
                     │  (Global) │        │   API       │
                     └───────────┘        └─────────────┘
```

---

## 📦 Katman Açıklamaları

### 1. API Layer (`/api`)

HTTP isteklerini yöneten katman.

```typescript
// httpClient.ts - Axios instance
const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

// createService.ts - Generic CRUD factory
export function createService<T>(endpoint: string) {
  return {
    getAll: () => httpClient.get<T[]>(endpoint),
    getById: (id: string) => httpClient.get<T>(`${endpoint}/${id}`),
    create: (data: T) => httpClient.post<T>(endpoint, data),
    update: (id: string, data: T) => httpClient.put<T>(`${endpoint}/${id}`, data),
    delete: (id: string) => httpClient.delete(`${endpoint}/${id}`),
  };
}
```

### 2. Hooks Layer (`/hooks`)

Business logic ve state yönetimi.

| Hook | Açıklama |
|------|----------|
| `useAsync` | Async işlemleri yönetir (loading, error, data) |
| `useSearch` | Arama fonksiyonalitesi |
| `useElasticSearch` | Elasticsearch entegrasyonu |
| `useDataTable` | Tablo verisi yönetimi |
| `usePagination` | Sayfalama mantığı |
| `useBoolean` | Boolean state toggle |
| `useClickOutside` | Dış tıklama algılama |
| `useBreakpoint` | Responsive breakpoint kontrolü |
| `useMediaQuery` | Media query dinleme |
| `useScroll` | Scroll pozisyonu takibi |
| `useWindowSize` | Pencere boyutu |
| `useTouchDevice` | Dokunmatik cihaz tespiti |
| `useIsClient` | Client-side render kontrolü |
| `useDropdown` | Dropdown state yönetimi |

### 3. Components Layer (`/components`)

UI bileşenleri. Detaylar için [COMPONENTS.md](./COMPONENTS.md).

### 4. App Layer (`/app`)

Next.js App Router sayfaları.

```
app/
├── (site)/           # Route grubu (URL'de görünmez)
│   ├── page.tsx      # / (Ana sayfa)
│   └── product/
│       └── [id]/
│           └── page.tsx  # /product/:id
├── layout.tsx        # Root layout
└── globals.css       # Global stiller
```

---

## 🎨 Styling Yaklaşımı

### Tailwind CSS 4

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-primary: #4f46e5;
  --color-secondary: #10b981;
  
  /* Custom spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
}
```

### Component Styling Pattern

```tsx
// Tailwind class composition
const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
};

function Button({ variant = "primary", children }) {
  return (
    <button className={cn("px-4 py-2 rounded-lg", variants[variant])}>
      {children}
    </button>
  );
}
```

---

## 🔐 Environment Variables

| Değişken | Tip | Açıklama |
|----------|-----|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Public | Backend API URL |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Public | API timeout (ms) |
| `NEXT_PUBLIC_APP_NAME` | Public | Uygulama adı |
| `NEXT_PUBLIC_APP_ENV` | Public | Ortam (development/production) |

---

## 🧪 Testing Stratejisi

```
tests/
├── unit/           # Jest unit tests
│   └── components/ # Component testleri
└── e2e/            # Playwright E2E tests
    └── *.spec.ts   # E2E senaryoları
```

### Unit Test Örneği

```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard name="Test Product" price={100} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

---

## 📝 Konvansiyonlar

### Dosya İsimlendirme
- **Components:** PascalCase (`ProductCard.tsx`)
- **Hooks:** camelCase, `use` prefix (`useSearch.ts`)
- **Utils:** camelCase (`formatPrice.ts`)
- **Constants:** UPPER_SNAKE_CASE içerik, camelCase dosya

### Import Sırası
1. React/Next.js
2. Üçüncü parti kütüphaneler
3. Internal imports (`@/...`)
4. Relative imports (`./...`)
5. Types
