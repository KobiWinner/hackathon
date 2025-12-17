# 🎨 Frontend - Hackathon App

Next.js 16 + React 19 + Tailwind CSS 4 ile geliştirilmiş modern fiyat karşılaştırma uygulaması.

---

## 📋 İçindekiler

- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Komutlar](#-komutlar)
- [Teknolojiler](#-teknolojiler)
- [Dokümantasyon](#-dokümantasyon)

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Development server başlat
npm run dev

# 3. Tarayıcıda aç
open http://localhost:3000
```

---

## 📦 Komutlar

### Development

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |

### Linting & Formatting

| Komut | Açıklama |
|-------|----------|
| `npm run lint` | ESLint ile kod kontrolü |
| `npm run lint:fix` | ESLint hataları otomatik düzelt |

### Testing

| Komut | Açıklama |
|-------|----------|
| `npm test` | Tüm testleri çalıştır |
| `npm run test:unit` | Sadece unit testleri çalıştır |
| `npm run test:watch` | Watch modunda test |
| `npm run test:coverage` | Test coverage raporu |
| `npm run test:e2e` | Playwright E2E testleri |
| `npm run test:e2e:ui` | Playwright UI modunda |
| `npm run test:e2e:chrome` | Sadece Chrome'da E2E |
| `npm run test:e2e:firefox` | Sadece Firefox'ta E2E |
| `npm run test:e2e:safari` | Sadece Safari'de E2E |

---

## 🛠 Teknolojiler

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Framework** | Next.js | 16.0.10 |
| **UI Library** | React | 19.2.1 |
| **Styling** | Tailwind CSS | 4.1.17 |
| **Animation** | Framer Motion | 12.23.26 |
| **HTTP Client** | Axios | 1.13.2 |
| **Icons** | Lucide React | 0.561.0 |
| **Charts** | Recharts | 3.6.0 |

### Dev Tools

| Araç | Açıklama |
|------|----------|
| TypeScript | Tip güvenliği |
| ESLint | Kod kalitesi |
| Jest | Unit testing |
| Playwright | E2E testing |
| Husky | Git hooks |
| CommitLint | Commit mesaj standardı |

---

## 📚 Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Mimari yapı ve klasör organizasyonu |
| [COMPONENTS.md](./COMPONENTS.md) | Component kütüphanesi |

---

## 🌐 Environment Variables

`.env.local` dosyası oluştur:

```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_TIMEOUT_MS=15000

# App
NEXT_PUBLIC_APP_NAME=Hackathon App
NEXT_PUBLIC_APP_ENV=development
```

---

## 📁 Proje Yapısı (Özet)

```
src/
├── api/          # HTTP client ve API servisleri
├── app/          # Next.js App Router sayfaları
├── components/   # React bileşenleri
├── config/       # Uygulama konfigürasyonu
├── constants/    # Sabit değerler
├── context/      # React Context'ler
├── data/         # Mock data
├── hooks/        # Custom React hooks
├── layout/       # Layout bileşenleri
├── lib/          # Utility fonksiyonlar
└── theme/        # Tema ayarları
```

Detaylı mimari için [ARCHITECTURE.md](./ARCHITECTURE.md) dosyasına bak.
