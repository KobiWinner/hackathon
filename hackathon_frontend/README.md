# ⚛️ Hackathon Frontend - Next.js 16

Fiyat karşılaştırma platformunun frontend uygulaması. Next.js 16 App Router, React 19, TypeScript ve Tailwind CSS v4 kullanır.

---

## 🏗️ Teknoloji Yığını

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 16.0.10 | React framework (App Router) |
| React | 19.2.1 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animations |
| Axios | 1.13 | HTTP client |
| Lucide React | Latest | Icon library |

### Testing
| Teknoloji | Kullanım |
|-----------|----------|
| Jest | Unit testing |
| React Testing Library | Component testing |
| Playwright | E2E testing |

---

## 🚀 Başlarken

**Gereksinimler:** Node.js 20+

```bash
# Kurulum
npm install

# Geliştirme sunucusu
npm run dev
# http://localhost:3000

# Production build
npm run build
npm run start
```

---

## 📂 Proje Yapısı

```
src/
├── api/                        # 🌐 API Layer
│   ├── auth/                   # Authentication API
│   │   ├── types.ts            # Auth request/response types
│   │   ├── authService.ts      # Login, register, logout
│   │   └── tokenService.ts     # JWT token management
│   ├── categories/             # Category API
│   │   ├── types.ts            # Category types
│   │   └── categoryService.ts  # getAll, getTree, getWithProducts
│   ├── search/                 # Search API
│   │   ├── types.ts            # Product search types
│   │   └── searchService.ts    # Elasticsearch search
│   ├── httpClient.ts           # Axios instance configuration
│   ├── interceptors.ts         # Request/response interceptors
│   ├── createService.ts        # Service factory utility
│   └── types.ts                # Shared API types
│
├── app/                        # 📄 Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/              # Login page
│   │   └── register/           # Register page
│   ├── (dashboard)/            # Dashboard route group
│   │   └── ...
│   ├── (site)/                 # Main site route group
│   │   ├── category/[slug]/    # Category detail + products
│   │   ├── product/[id]/       # Product detail
│   │   ├── search/             # Search results
│   │   ├── customerService/    # Customer service
│   │   ├── layout.tsx          # Site layout
│   │   └── page.tsx            # Homepage
│   ├── globals.css             # Global styles + Tailwind
│   └── layout.tsx              # Root layout
│
├── components/                 # 🎨 React Components
│   ├── ui/                     # Reusable UI components
│   │   ├── buttons/            # Button variants
│   │   ├── feedback/           # Skeleton, Toast
│   │   ├── typography/         # Text, Heading
│   │   ├── Dropdown/           # Dropdown component
│   │   ├── Container.tsx       # Container wrapper
│   │   ├── Input.tsx           # Form input
│   │   └── ScrollArea.tsx      # Custom scroll area
│   ├── header/                 # Header components
│   │   ├── Header.tsx          # Main header
│   │   ├── SearchBar.tsx       # Search input
│   │   └── CategoriesDropdown.tsx
│   ├── home/                   # Homepage components
│   │   └── ...
│   ├── product/                # Product components
│   │   └── ...
│   └── CustomerServiceFAB.tsx  # Floating action button
│
├── hooks/                      # 🪝 Custom React Hooks
│   ├── useSearch.ts            # Search state management
│   ├── useElasticSearch.ts     # Elasticsearch integration
│   ├── useAsync.ts             # Async state wrapper
│   ├── useDropdown.ts          # Dropdown logic
│   ├── usePagination.ts        # Pagination state
│   ├── useClickOutside.ts      # Click outside detection
│   ├── useBreakpoint.ts        # Responsive breakpoints
│   ├── useMediaQuery.ts        # Media query hook
│   ├── useScroll.ts            # Scroll detection
│   ├── useWindowSize.ts        # Window dimensions
│   ├── useBoolean.ts           # Boolean toggle
│   ├── useIsClient.ts          # SSR check
│   ├── useTouchDevice.ts       # Touch detection
│   └── useDataTable.ts         # Table state management
│
├── layout/                     # 📐 Layout Components
│   ├── site/                   # Site layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SiteLayout.tsx
│   └── dashboard/              # Dashboard layout
│       └── ...
│
├── context/                    # 🔄 React Context
│   └── ...
│
├── config/                     # ⚙️ App Configuration
│   └── ...
│
├── constants/                  # 📌 Constants
│   └── ...
│
├── data/                       # 📊 Static/Mock Data
│   └── ...
│
├── lib/                        # 🔧 Utility Functions
│   └── cn.ts                   # Tailwind class merger
│
└── theme/                      # 🎨 Theme Configuration
    └── ...
```

---

## 🌐 API Layer

### Yapı

Her API modülü aynı pattern'i takip eder:

```
api/<module>/
├── types.ts          # TypeScript types (request/response)
├── <module>Service.ts # API methods
└── index.ts          # Exports
```

### Kullanım

```typescript
// Category API kullanımı
import { categoryService } from '@/api/categories';

// Tüm kategorileri getir
const result = await categoryService.getAll();
if (result.success) {
  console.log(result.data); // CategoryResponse[]
}

// Kategori + ürünleri getir
const categoryResult = await categoryService.getWithProducts('elektronik', {
  page: 1,
  page_size: 24,
  min_price: 100,
});
```

### Mevcut API Modülleri

| Modül | Dosya | Metodlar |
|-------|-------|----------|
| Auth | `api/auth/authService.ts` | `login`, `register`, `logout` |
| Categories | `api/categories/categoryService.ts` | `getAll`, `getTree`, `getWithProducts` |
| Search | `api/search/searchService.ts` | `searchProducts`, `suggest` |

---

## 🪝 Custom Hooks

### Önemli Hooks

| Hook | Kullanım | Örnek |
|------|----------|-------|
| `useSearch` | Arama state yönetimi | SearchBar |
| `useElasticSearch` | ES araması | Search page |
| `useAsync` | API call wrapper | Data fetching |
| `useDropdown` | Dropdown toggle | CategoriesDropdown |
| `usePagination` | Sayfalama | Category page |
| `useClickOutside` | Dış tıklama tespiti | Modal, Dropdown |
| `useBreakpoint` | Responsive kontrol | Layout |

### Örnek Kullanım

```typescript
// useAsync hook
const { data, loading, error, execute } = useAsync(
  () => categoryService.getAll(),
  { immediate: true }
);

// useDropdown hook
const { isOpen, toggle, close, ref } = useDropdown();
```

---

## 🎨 UI Components

### Button

```tsx
import { Button } from '@/components/ui/buttons/Button';

<Button variant="solid" txt="Kaydet" />
<Button variant="ghost" icon={<Search />} />
<Button variant="outline" size="sm" txt="İptal" />
```

### Text & Heading

```tsx
import { Text, Heading } from '@/components/ui/typography/Text';

<Heading level={1} size="2xl">Başlık</Heading>
<Text size="sm" color="muted">Alt metin</Text>
<Text maxLines={2}>Uzun metin...</Text>
```

### Skeleton

```tsx
import { Skeleton } from '@/components/ui/feedback/Skeleton';

<Skeleton className="h-4 w-32" />
<Skeleton className="aspect-square" />
```

---

## 🧪 Test Komutları

```bash
# Unit testler
npm run test

# Watch modunda
npm run test:watch

# Coverage raporu
npm run test:coverage

# E2E testler (Playwright)
npm run test:e2e

# Belirli tarayıcıda E2E
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari
```

---

## 📏 Lint & Format

```bash
# Lint kontrolü
npm run lint

# Lint düzeltme
npm run lint:fix
```

### Aktif ESLint Kuralları

- `no-console` (error hariç)
- `no-debugger`
- `@typescript-eslint/consistent-type-imports`
- `@typescript-eslint/no-unused-vars`
- `react-hooks/exhaustive-deps`
- `import/order` (import sıralaması)

---

## 🎨 Styling Guidelines

### Tailwind CSS v4

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(70% 0.15 200);
  --color-background: var(--background);
  /* ... */
}
```

### Breakpoints

| Breakpoint | Min Width | Kullanım |
|------------|-----------|----------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Responsive Pattern

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(p => <ProductCard key={p.id} />)}
</div>
```

---

## 📋 Yeni Feature Ekleme

### 1. API Modülü

```bash
src/api/<feature>/
├── types.ts
├── <feature>Service.ts
└── index.ts
```

### 2. Sayfa

```bash
src/app/(site)/<feature>/
├── page.tsx          # 'use client' ile başla
└── loading.tsx       # (opsiyonel) Loading state
```

### 3. Component

```bash
src/components/<feature>/
└── FeatureComponent.tsx
```

### 4. Hook (opsiyonel)

```bash
src/hooks/use<Feature>.ts
```

---

## 👥 Commit Kuralları

- **Format:** Conventional Commits
  ```
  feat: add category page
  fix: resolve search debounce issue
  chore: update dependencies
  ```
- **Pre-commit:** Husky ile `npm run lint` otomatik çalışır
- **Commitlint:** Commit mesajı formatı kontrol edilir

---

## 🔗 İlgili Dosyalar

- [Root README](../README.md) - Proje genel bakış
- [Backend README](../hackathon_backend/README.md) - Backend mimarisi
