# Storefront ↔ Owuan API Agent

Bu dosya, `b2c-client-storefront` (Next.js Commerce template fork) geliştirirken
owuan-dashboard API'si ile uyumlu kod yazman için zorunlu referanstır.

## Zorunlu Kural: Önce Schema, Sonra Kod

**Herhangi bir API çağrısı yazmadan önce ilgili schema dosyasını oku:**

```
../owuan/.opencode/storefront-schemas/index.json    ← Ana index, tüm endpoint listesi
../owuan/.opencode/storefront-schemas/manifest.json   ← GET /storefront/manifest
../owuan/.opencode/storefront-schemas/product-list.json   ← GET /storefront/products
../owuan/.opencode/storefront-schemas/product-detail.json ← GET /storefront/products/:slug
../owuan/.opencode/storefront-schemas/auth.json      ← Tüm auth endpoint'leri
../owuan/.opencode/storefront-schemas/cart.json       ← Sepet + kupon
../owuan/.opencode/storefront-schemas/favorites.json   ← Favoriler
../owuan/.opencode/storefront-schemas/checkout.json    ← Sipariş
../owuan/.opencode/storefront-schemas/address.json     ← Adres CRUD
```

Schema dosyası, API'nin döndüğü **gerçek** JSON formatını belgeler.
"Sanırım şu alan vardır" diye tahmin etme — schema'yı oku.

## API Bağlantısı

### Base URL
- Development: `http://localhost:3000` (otomatik, env gerekmez)
- Production: `https://app.owuan.com` (otomatik, env gerekmez)
- Özel override: `NEXT_PUBLIC_OWUAN_API_URL` env var

### Kimlik Doğrulama

Her istekte iki header olabilir:

| Header | Zorunlu | Açıklama |
|---|---|---|
| `X-Store-API-Key` | Her istekte | Tenant çözümlemesi. `OWUAN_STORE_API_KEY` env var'dan okunur. **Asla client bundle'a gömülmez.** |
| `Authorization: Bearer <jwt>` | Müşteri işlemleri | signup/signin'den alınan JWT. `localStorage("owuan-auth-token")`'da saklanır. |

### İstek Stratejisi (`lib/owuan/client.ts`)

Mevcut `client.ts` **doğru pattern'i** uyguluyor:

```
Server Components → doğrudan app.owuan.com'a fetch (API key process.env'den)
Client Components → /api/proxy/* üzerinden (API key server-side eklenir)
```

**Bu pattern'i bozma.** Yeni bir fetch wrapper'ı yazma. Mevcut `lib/owuan/` yapısını kullan:
- `client.ts` — fetch wrapper (proxyUrl, getAuthHeaders, proxyFetch, owuanGet/Post/Patch/Delete)
- `types.ts` — Product, Collection, Cart, Manifest vb. TypeScript tipleri
- `index.ts` — Ana provider, tüm API fonksiyonları + fallback
- `stores.ts` — Zustand store'lar (cart, wishlist, recentlyViewed)

## Endpoint Hızlı Referans

### Public (sadece API Key)

| Method | Path | Dönüş |
|---|---|---|
| GET | `/storefront/manifest` | Mağaza ayarları + kategoriler + koleksiyonlar + gateway'ler + guestCheckoutEnabled |
| GET | `/storefront/products?limit=&offset=&sort=&search=&category=&collection=&brand=&label=` | Ürün listesi (sayfalı) |
| GET | `/storefront/products/:slug` | Ürün detayı (varyantlar + seçenekler + görseller) |

**GET /storefront/products Query Parametreleri:**

| Parametre | Tip | Açıklama |
|---|---|---|
| `limit` | number | Sayfa başına ürün (max 50, default 20) |
| `offset` | number | Atlanacak kayıt sayısı |
| `sort` | string | Sıralama (örn: `title.asc`, `price.desc`, `created_at.desc`) |
| `search` | string | Başlık ve açıklamada arama |
| `category` | string | Kategori slug'ına göre filtreleme |
| `collection` | string | Koleksiyon slug'ına göre filtreleme |
| `brand` | string | Marka slug'ına göre filtreleme |
| `label` | string | Etiket slug'ına göre filtreleme |
| POST | `/storefront/auth/signup` | `{ email, password, name, lastName? }` → `{ token, user }` |
| POST | `/storefront/auth/signin` | `{ email, password }` → `{ token, user }` |
| POST | `/storefront/auth/forgot-password` | `{ email }` → dev'de `resetToken` döner |
| POST | `/storefront/auth/reset-password` | `{ token, password }` → şifre sıfırlanır |
| POST | `/storefront/checkout/guest` | `{ email, fullName, phone, address: {...} }` → misafir siparişi |

### Müşteri (API Key + JWT)

| Method | Path | Dönüş |
|---|---|---|
| GET | `/storefront/auth/me` | Kullanıcı profili |
| PATCH | `/storefront/auth/me` | Profil güncelle `{ name?, lastName?, phone?, avatar? }` |
| GET | `/storefront/address` | Adres listesi |
| POST | `/storefront/address` | Adres ekle |
| PATCH | `/storefront/address/:id` | Adres güncelle |
| DELETE | `/storefront/address/:id` | Adres sil |
| GET | `/storefront/favorites` | Favori listesi (ürün bilgileriyle) |
| POST | `/storefront/favorites` | `{ productId, variantId? }` → favori ekle |
| DELETE | `/storefront/favorites/:productId` | Favori sil |
| GET | `/storefront/cart` | Sepet (toplam, KDV, items) |
| POST | `/storefront/cart/items` | `{ variantId, quantity }` → sepete ekle |
| PATCH | `/storefront/cart/items/:id` | `{ quantity }` → miktar güncelle (0 = sil) |
| DELETE | `/storefront/cart/items/:id` | Sepetten sil |
| POST | `/storefront/cart/coupon` | `{ code }` → kupon doğrula/uygula |
| POST | `/storefront/checkout` | `{ addressId, note? }` → üye siparişi |
| GET | `/storefront/orders` | Sipariş listesi |
| GET | `/storefront/orders/:id` | Sipariş detayı (kalemler + adres) |

## Standart Yanıt Formatı

```typescript
// Başarılı
{ success: true, data: T, meta?: { totalCount, limit, offset, page, totalPages } }

// Hata
{ success: false, error: "Türkçe hata mesajı" }
```

## Para Birimi

**Tüm fiyatlar `TRY` ve dot-separated string formatında:**

```json
{ "amount": "1299.99", "currencyCode": "TRY" }
```

Client'ta `formatPrice` fonksiyonu virgül formatına çevirir: `₺1.299,99`

## KDV Hesaplama

KDV artık **ürün bazında** `products.vatRate` kolonundan gelir (`20` = %20).
Sepet ve sipariş toplamlarında bu oran kullanılır. Hardcoded %20 yok.

## Varyant Seçenek Eşleşmesi

Ürün detayında (`/storefront/products/:slug`) varyantların `selectedOptions` alanı
artık dolu gelir:

```json
{
  "id": "variant-uid",
  "title": "SKU-001",
  "availableForSale": true,
  "selectedOptions": [
    { "name": "Renk", "value": "Kırmızı" },
    { "name": "Beden", "value": "M" }
  ],
  "price": { "amount": "299.99", "currencyCode": "TRY" }
}
```

Storefront, bu bilgiyi kullanarak "Red / M" gibi varyant seçim UI'ı oluşturabilir.

## Dummy Data Kuralı

`lib/owuan/dummy-data.ts` **sadece API erişilemediğinde fallback** olarak kullanılır.
API müsait olduğunda her zaman gerçek API kullanılır (`lib/owuan/index.ts` bu mantığı uygular).

Dummy data'nın API kontratıyla birebir uyumlu olması zorunlu değildir —
UI'ın çökmeden gösterilebilmesi yeterlidir.

## Storefront ↔ Owuan Tablo Eşleşmesi

| Storefront Kavramı | Owuan Tenant DB Tablo |
|---|---|
| Ürünler | `products` + `productVariant` + `images` + `productVariantOptions` |
| Kategoriler | `categories` (artık `image` alanı da içerir) |
| Koleksiyonlar | `collections` (artık `image` alanı da içerir) |
| Markalar | `brands` |
| Favoriler | `favorites` |
| Sepet | `cart` + `cartItems` |
| Siparişler | `orders` + `orderItems` |
| Müşteriler | `users` (userType=0) |
| Adresler | `address` |
| Ödeme gateway | `b2c_payment_gateways` (isActive=true, credentials YOK) |
| Kargo gateway | `b2c_carrier_gateways` (isActive=true, credentials YOK) |
| Mağaza ayarları | `stores` |
| Kupon/İndirim | `campaigns` |
| Ürün Etiketleri | `labels` |

## Geliştirme Akışı

```bash
# Owuan API (localhost:3000)
cd ../owuan && pnpm dev

# Storefront (localhost:3002)
pnpm dev
```

Owuan API çalışmıyorsa storefront dummy data'ya düşer.

## API Değişikliği Olduğunda

1. owuan'da `.opencode/storefront-schemas/` altındaki ilgili schema güncellenir
2. owuan'da API implementasyonu yapılır
3. Storefront'ta çalışan agent **önce schema'yı okur**, sonra kodu günceller
4. `lib/owuan/types.ts` TypeScript tipleri schema'ya göre güncellenir
5. `lib/owuan/index.ts` provider fonksiyonları yeni/monte edilir
6. İlgili sayfa/component'ler yeni veri formatına uyarlanır

## Kampanya Desteği
- Ürünlerde `campaignBadges[]` → kampanya etiketleri (örn: "%20 İndirim")
- Varyantlarda `compareAtPrice` → indirimli fiyat gösterimi için orijinal fiyat
- Sepette `discountTotal` + `appliedCampaigns[]` → otomatik hesaplanmış indirimler
- Manifest'te `activeCampaigns[]` → aktif kampanya listesi

## Cloudinary / Medya
Tüm görseller Cloudinary'de `b2c/{clerkOrgId}/{entity}/{uid}` klasör yapısında saklanır.
Entity tipleri: products, variants, brands, categories, collections, ai/images, ai/videos, ai/audio, ai/marketings.
