---
trigger: always_on
---

# B2C Client Storefront

## Proje Tanımı
- **Amaç**: Owuan SaaS altyapısında barındırılan B2C mağazaların müşteriye dönük yüzü (storefront).
- **Temel**: Next.js Commerce template fork'u — Next.js 16 App Router + shadcn/ui + Tailwind CSS v4.
- **Status**: Development.
- **Repo**: `m-ozan-a/owuan-storefront`

## Git Push & Vercel Deploy — KESİNLİKLE YASAK (ÖNCE İZİN AL!)

Aşağıdaki komutlar **kullanıcıdan açık emir alınmadan ASLA çalıştırılmaz:**

- `git push`
- `git push origin <branch>`
- `vercel deploy`
- `vercel --prod`
- `git push` tetikleyen herhangi bir işlem (örn: PR merge)

**Sebep**: owuan ve storefront repoları aynı GitHub hesabında, Vercel auto-deploy ile bağlı.
Her push, production/preview deployment tetikler → Vercel deploy limiti şişer → deployment geçmişi kirlenir.

**Kural**: Yukarıdaki komutlardan birini çalıştırmadan önce kullanıcıdan şu şekilde izin al:
> "Değişiklikleri push/deploy etmemi ister misin?"

Kullanıcı "evet", "push at", "deploy et" vb. açıkça onay vermedikçe bu komutları çalıştırma.
`git commit` bu kurala dahil değildir — sadece push ve deploy yasaktır.

## Owuan Bağımlılığı

Bu proje **tamamen owuan-dashboard'a bağımlıdır**. Tüm veri (ürünler, sepet, siparişler, müşteri hesapları) owuan API'si üzerinden gelir.

- **API kaynağı**: `../owuan/` — owuan-dashboard (Next.js 16 + Hono API)
- **API kontratı**: `../owuan/.opencode/storefront-schemas/` — JSON schema dosyaları
- **Agent referansı**: `.opencode/agents/storefront-api.md` — API kullanım kuralları

### Çapraz Klasör Geliştirme (Çok Önemli!)

Bu projede çalışırken **sık sık `../owuan/` klasörüne geçiş yapman gerekebilir.**
Storefront'un ihtiyaç duyduğu bir API endpoint'i eksikse veya yanıt formatı değiştiyse,
önce owuan tarafında düzeltme yap, sonra storefront'u güncelle.

**Kural**: Storefront asla doğrudan veritabanına bağlanmaz.
Tüm CRUD işlemleri owuan API üzerinden yapılır.

### Geliştirme Akışı
```bash
# 1. İki sunucuyu tek komutla başlat (www/ root'undan)
cd .. && pnpm dev            # owuan:3000 + storefront:3002

# 2. Veya ayrı ayrı:
cd ../owuan && pnpm dev       # Owuan API (localhost:3000)
pnpm dev                      # Storefront (localhost:3002)
```

Owuan API çalışmıyorsa storefront `lib/owuan/dummy-data.ts` fallback'ine düşer.

### Ortam Otomatik Algılama

Storefront `NEXT_PUBLIC_OWUAN_API_URL`'i artık otomatik algılar:
- `lib/owuan/client.ts` içindeki `getApiBaseUrl()` fonksiyonu
- **Local dev**: otomatik `http://localhost:3000`
- **Production (Vercel)**: otomatik `https://app.owuan.com`
- **Özel override**: `NEXT_PUBLIC_OWUAN_API_URL` env var set edilirse onu kullanır

## Mimari Özet

```
b2c-client-storefront/
├── app/
│   ├── page.tsx                  # Ana sayfa
│   ├── layout.tsx                # Root layout (AuthProvider, Header, Footer, CartDrawer)
│   ├── product/[handle]/         # Ürün detay sayfası
│   ├── search/[[...collection]]/ # Arama/Koleksiyon sayfası
│   ├── checkout/                 # Sepet ve ödeme
│   └── account/                  # Müşteri hesabı (login, register, profil)
├── lib/owuan/
│   ├── index.ts                  # Provider — API öncelikli, dummy fallback
│   ├── client.ts                 # API fetch wrapper (proxy + direkt)
│   ├── types.ts                  # TypeScript tipleri
│   ├── stores.ts                 # Zustand (cart, wishlist)
│   └── dummy-data.ts             # Fallback veri (API yoksa)
├── components/
│   ├── auth/                     # AuthProvider + AuthForm
│   ├── cart/                     # CartDrawer, WishlistDrawer
│   ├── product/                  # ProductCard, ProductGrid, ProductGallery
│   └── ui/                       # shadcn/ui bileşenleri
└── .opencode/agents/
    └── storefront-api.md         # API kullanım referansı
```

## Teknoloji Yığını
- **Framework**: Next.js 16 (App Router), React 19
- **UI**: shadcn/ui, Tailwind CSS v4, Radix UI, Lucide React
- **State**: Zustand (cart, wishlist) + localStorage
- **Form**: React Hook Form + Zod
- **HTTP Client**: Native fetch (lib/owuan/client.ts proxy pattern'i ile)

## API Bağlantısı

### Auth
- `X-Store-API-Key` header'ı (tüm isteklerde, `OWUAN_STORE_API_KEY` env var'dan)
- `Authorization: Bearer <jwt>` header'ı (müşteri işlemleri, `localStorage("owuan-auth-token")`)

### Proxy Pattern
```
Server Components → doğrudan owuan API'ye fetch (API key server-side)
Client Components → /api/proxy/* üzerinden (API key server-side eklenir)
```

Dosya: `app/api/proxy/[...path]/route.ts` + `lib/owuan/client.ts`

### Dummy Data
`lib/owuan/dummy-data.ts` sadece owuan API'ye erişilemediğinde fallback olarak kullanılır.
API müsait olduğunda `lib/owuan/index.ts` otomatik olarak API'yi tercih eder.

## Para Birimi
Tüm fiyatlar `TRY (₺)`. Backend'den dot-separated string gelir (`"1299.99"`).
Client'ta `formatPrice()` virgül formatına çevirir: `₺1.299,99`.

## Kimlik Doğrulama
Storefront kendi auth sistemini kullanır (better-auth değil, owuan JWT).
- Kayıt/Giriş: owuan API `/storefront/auth/signup`, `/storefront/auth/signin`
- Token: HS256 JWT, 7 gün geçerli, `localStorage("owuan-auth-token")`'da saklanır

## Kısıtlamalar
1. **Asla doğrudan DB'ye bağlanma** — her şey owuan API üzerinden
2. **Dummy data fallback'tir** — API varken API kullan
3. **OWUAN_STORE_API_KEY asla client bundle'a gömülmez** — `NEXT_PUBLIC_` prefix'i YOK
4. **API kontratına uy** — `.opencode/agents/storefront-api.md`'i oku
5. **owuan'da API değişikliği gerekiyorsa** — önce `../owuan/` klasöründe düzeltme yap
