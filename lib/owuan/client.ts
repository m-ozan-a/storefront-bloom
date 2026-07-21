// Owuan Storefront API Client
// All requests go through /api/proxy/[...] to keep OWUAN_STORE_API_KEY server-only

import { getStorefrontManifest } from "./manifest";

// Server-side: call owuan API directly (API key available)
// Client-side: go through /api/proxy to keep API key server-only

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_OWUAN_API_URL) {
    return process.env.NEXT_PUBLIC_OWUAN_API_URL;
  }
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "https://app.owuan.com";
  }
  return "http://localhost:3000";
}

const API_BASE = getApiBaseUrl();

function proxyUrl(endpoint: string): string {
  if (typeof window === "undefined") {
    return `${API_BASE}/api${endpoint}`;
  }
  return `/api/proxy${endpoint}`;
}

function getAuthHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extraHeaders };
  // Server-side: add API key
  if (typeof window === "undefined") {
    headers["X-Store-API-Key"] = process.env.OWUAN_STORE_API_KEY || "";
  }
  // Client-side: add Bearer token if logged in
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("owuan-auth-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function proxyFetch<T = unknown>(
  endpoint: string,
  options: { method?: string; body?: unknown; next?: { revalidate?: number; tags?: string[] }; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = proxyUrl(endpoint);
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: getAuthHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: options.next,
  });
  const json = (await res.json()) as {
    success: boolean; data?: T; error?: string; meta?: unknown; message?: string;
  };
  if (!json.success) throw new Error(json.error || "API request failed");
  return (json.data !== undefined ? json.data : json) as T;
}

// ---- Products ----

import type { Product, Collection, Manifest, Page } from "./types";

export async function getProducts(options?: {
  collection?: string; query?: string; sortKey?: string;
  reverse?: boolean; limit?: number; offset?: number;
  category?: string[]; brand?: string[];
  minPrice?: number; maxPrice?: number;
  size?: string[]; color?: string[];
  label?: string[];
  revalidate?: number;
}): Promise<Product[]> {
  const p = new URLSearchParams();
  if (options?.collection) p.set("collection", options.collection);
  if (options?.query) p.set("search", options.query);
  if (options?.sortKey) {
    const col = options.sortKey === "PRICE" ? "price" : "created_at";
    p.set("sort", `${col}.${options.reverse ? "asc" : "desc"}`);
  }
  if (options?.limit) p.set("limit", String(options.limit));
  if (options?.offset) p.set("offset", String(options.offset));
  if (options?.category?.length) p.set("category", options.category.join(","));
  if (options?.brand?.length) p.set("brand", options.brand.join(","));
  if (options?.minPrice != null) p.set("minPrice", String(options.minPrice));
  if (options?.maxPrice != null) p.set("maxPrice", String(options.maxPrice));
  if (options?.size?.length) p.set("size", options.size.join(","));
  if (options?.color?.length) p.set("color", options.color.join(","));
  if (options?.label?.length) p.set("label", options.label.join(","));
  const qs = p.toString();
  return proxyFetch<Product[]>(`/storefront/products${qs ? `?${qs}` : ""}`, {
    next: { revalidate: options?.revalidate ?? 30, tags: ["products"] },
  });
}

export async function getProductCount(options?: {
  collection?: string; query?: string;
  category?: string[]; brand?: string[];
  minPrice?: number; maxPrice?: number;
  size?: string[]; color?: string[];
  label?: string[];
}): Promise<number> {
  const p = new URLSearchParams();
  if (options?.collection) p.set("collection", options.collection);
  if (options?.query) p.set("search", options.query);
  if (options?.category?.length) p.set("category", options.category.join(","));
  if (options?.brand?.length) p.set("brand", options.brand.join(","));
  if (options?.minPrice != null) p.set("minPrice", String(options.minPrice));
  if (options?.maxPrice != null) p.set("maxPrice", String(options.maxPrice));
  if (options?.size?.length) p.set("size", options.size.join(","));
  if (options?.color?.length) p.set("color", options.color.join(","));
  if (options?.label?.length) p.set("label", options.label.join(","));
  const qs = p.toString();
  return proxyFetch<{ count: number }>(`/storefront/products/count${qs ? `?${qs}` : ""}`, { next: { revalidate: 30 } })
    .then((d) => d.count)
    .catch(() => 0);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    return await proxyFetch<Product>(`/storefront/products/${handle}`, {
      next: { revalidate: 60, tags: ["products", `product:${handle}`] },
    });
  } catch { return undefined; }
}

export async function getProductById(_id: string): Promise<Product | undefined> {
  return undefined; // Not implemented — use getProduct(handle) instead
}

// Öneriler statik R2'den: recommendations/product-{uid}.json → UID'ler products.json'dan eşlenir.
export async function getProductRecommendations(productUid: string): Promise<Product[]> {
  const { getStaticProductRows, rowToProduct } = await import("./static-products");
  const { storefrontDataUrl } = await import("./manifest");
  try {
    const res = await fetch(storefrontDataUrl(`recommendations/product-${productUid}.json`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const recs = (await res.json()) as { type: string; productUid: string; rank: number }[];
    if (!Array.isArray(recs) || recs.length === 0) return [];
    const rows = await getStaticProductRows();
    const byId = new Map(rows.map((r) => [r.id, r]));
    return recs
      .sort((a, b) => a.rank - b.rank)
      .map((rec) => byId.get(rec.productUid))
      .filter((r): r is NonNullable<typeof r> => !!r)
      .map(rowToProduct);
  } catch {
    return [];
  }
}

// ---- Manifest ----

let cachedManifest: Manifest | null = null;
let manifestFetchedAt = 0;
const MANIFEST_TTL = process.env.NODE_ENV === "development" ? 0 : 5 * 60 * 1000;
const MANIFEST_REVALIDATE = process.env.NODE_ENV === "development" ? 0 : 300;

export async function getManifest(headers?: Record<string, string>): Promise<Manifest> {
  if (MANIFEST_TTL > 0 && cachedManifest && Date.now() - manifestFetchedAt < MANIFEST_TTL) return cachedManifest;
  const data = await proxyFetch<Manifest>("/storefront/manifest", { next: { revalidate: MANIFEST_REVALIDATE }, headers });
  cachedManifest = data;
  manifestFetchedAt = Date.now();
  return data;
}

export async function getCollections(): Promise<Collection[]> {
  const m = await getManifest();
  return m.collections.map(c => ({
    handle: c.slug, title: c.title,
    description: c.description || "",
    seo: { title: c.title, description: c.description || "" },
    updatedAt: new Date().toISOString(), path: `/search/${c.slug}`,
  }));
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const m = await getManifest();
  const c = m.collections.find(x => x.slug === handle);
  if (!c) return undefined;
  return {
    handle: c.slug, title: c.title,
    description: c.description || "",
    seo: { title: c.title, description: c.description || "" },
    updatedAt: new Date().toISOString(), path: `/search/${c.slug}`,
  };
}

export async function getCollectionProducts(
  collection: string,
  options?: { sortKey?: string; reverse?: boolean }
): Promise<Product[]> {
  return getProducts({ collection, ...options });
}

// ---- Auth ----

interface AuthResponse { token: string; user: { id: string; email: string; name: string }; }

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return proxyFetch<AuthResponse>("/storefront/auth/signin", {
    method: "POST", body: { email, password },
  });
}

export async function signUp(
  email: string, password: string, name: string, lastName?: string
): Promise<AuthResponse> {
  return proxyFetch<AuthResponse>("/storefront/auth/signup", {
    method: "POST", body: { email, password, name, lastName },
  });
}

export async function getMe(
  token: string
): Promise<{ id: string; email: string; name: string } | null> {
  try {
    return await proxyFetch("/storefront/auth/me");
  } catch { return null; }
}

// ---- Menu ----

export async function getMenu(
  handle: "header" | "footer"
): Promise<{ title: string; path: string }[]> {
  try {
    const m = await getManifest();
    const sections = m.activeTheme?.sections;
    const navItems = sections?.navigation?.[handle];

    if (navItems && navItems.length > 0) {
      return flattenNavItems(navItems);
    }

    const cats = m.categories.filter(c => c.isActive);
    if (handle === "header") {
      return cats.slice(0, 7).map(c => ({ title: c.title, path: `/search/${c.slug}` }));
    }
  } catch {}
  return [];
}

function flattenNavItems(items: import("./types").NavItem[]): { title: string; path: string }[] {
  const result: { title: string; path: string }[] = [];
  for (const item of items) {
    const path = item.path || (item.slug ? `/search/${item.slug}` : "#");
    result.push({ title: item.title, path });
    if (item.children) {
      result.push(...flattenNavItems(item.children));
    }
  }
  return result;
}
export async function getNavTree(handle: "header" | "footer"): Promise<import("./types").NavItem[]> {
  try {
    const m = await getManifest();
    const navItems = m.activeTheme?.sections?.navigation?.[handle];
    if (navItems && navItems.length > 0) return navItems;

    const cats = m.categories.filter(c => c.isActive);
    if (handle === "header") {
      return cats.slice(0, 7).map(c => ({ title: c.title, type: "category" as const, slug: c.slug }));
    }
  } catch {}
  return [];
}

// ---- Pages ----
// Tek kaynak: R2 manifest (pages[].content). API'ye gidilmez; içerik değişimi
// R2 republish ile yayınlanır. uid/createdAt manifest'te yok — slug/manifest
// updatedAt ile doldurulur, tüketiciler bu alanları kullanmaz.

function manifestPageToPage(
  p: NonNullable<Awaited<ReturnType<typeof getStorefrontManifest>>>["pages"][number],
  manifestUpdatedAt: number | undefined,
): Page {
  const updatedAt = manifestUpdatedAt ? new Date(manifestUpdatedAt).toISOString() : "";
  return {
    uid: p.slug,
    slug: p.slug,
    title: p.title,
    content: p.content ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    isPublished: p.isPublished !== false,
    createdAt: updatedAt,
    updatedAt,
  };
}

export async function getPage(slug: string): Promise<Page | null> {
  const m = await getStorefrontManifest();
  const p = m?.pages?.find((x) => x.slug === slug);
  return p ? manifestPageToPage(p, m?.updatedAt) : null;
}

export async function getPages(): Promise<Page[]> {
  const m = await getStorefrontManifest();
  return (m?.pages ?? []).map((p) => manifestPageToPage(p, m?.updatedAt));
}

// ---- Newsletter ----

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  return proxyFetch<{ success: boolean; message?: string }>("/storefront/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}

// ---- Cart ----

export interface ServerCartItem {
  id: string;
  quantity: number;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string };
  product: {
    uid: string;
    handle: string;
    title: string;
    featuredImage: string | { url: string; altText?: string } | null;
  };
  variant: {
    uid: string;
    selectedOptions: { name: string; value: string }[];
  };
}

export interface ServerCart {
  id: string | null;
  items: ServerCartItem[];
  total: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  totalQuantity: number;
  appliedCampaigns: Array<{
    uid: string;
    title: string;
    campaignType: string;
    discountApplied: number;
    description: string;
  }>;
}

export async function getCart(): Promise<ServerCart | null> {
  try {
    return await proxyFetch<ServerCart>("/storefront/cart");
  } catch { return null; }
}

export async function addToCartApi(
  variantUid: string | null,
  quantity = 1,
  productUid?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  // Varyantsız ürünlerde variantId yok → productId gönder, API default variant'ı çözer.
  const body = variantUid
    ? { variantId: variantUid, quantity }
    : { productId: productUid, quantity };
  return proxyFetch("/storefront/cart/items", { method: "POST", body });
}

export async function updateCartItemApi(
  itemUid: string,
  quantity: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  return proxyFetch(`/storefront/cart/items/${itemUid}`, {
    method: "PATCH",
    body: { quantity },
  });
}

export async function removeCartItemApi(
  itemUid: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  return proxyFetch(`/storefront/cart/items/${itemUid}`, {
    method: "DELETE",
  });
}

// ---- Checkout ----

export interface GuestCheckoutData {
  email: string; fullName: string; phone: string;
  address: { title: string; address: string; city: string; state: string; zip: string; country: string };
  // Misafir sepeti lokalde tutulur; sunucu stok/fiyat/KDV doğrulamasını bu listeyle yapar (schema: zorunlu, minItems 1).
  items: { variantId: string; quantity: number }[];
  note?: string; paymentProvider?: string; deliveryOptionId?: string;
}

export interface CheckoutResult { orderId: string; orderNumber: string; status: string; }

export async function guestCheckout(data: GuestCheckoutData): Promise<CheckoutResult> {
  return proxyFetch<CheckoutResult>("/storefront/checkout/guest", { method: "POST", body: data });
}

// ---- Orders ----

export interface OrderListItem {
  uid: string;
  orderId: string;
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  total: number;
  shippingTotal: number;
  createdAt: number;
}

export interface OrderDetailItem {
  uid: string;
  quantity: number;
  price: number;
  discountTotal: number;
  taxRate: number;
  taxTotal: number;
  title: string | null;
  slug: string | null;
  featuredImage: string | null;
}

export interface OrderDetail {
  uid: string;
  orderId: string;
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  total: number;
  shippingTotal: number;
  totalTax: number;
  totalDiscount: number;
  note: string;
  trackingNumber: string;
  trackingUrl: string;
  trackingCarrier: string;
  guestEmail: string | null;
  guestFullName: string | null;
  guestPhone: string | null;
  createdAt: number;
  items: OrderDetailItem[];
  address: {
    uid: string;
    title: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
}

export async function getOrders(): Promise<OrderListItem[]> {
  try {
    return await proxyFetch<OrderListItem[]>("/storefront/orders");
  } catch {
    return [];
  }
}

export async function getOrder(uid: string): Promise<OrderDetail | null> {
  try {
    return await proxyFetch<OrderDetail>(`/storefront/orders/${uid}`);
  } catch {
    return null;
  }
}

export async function memberCheckout(addressId: string, note?: string, paymentProvider?: string, deliveryOptionId?: string): Promise<CheckoutResult> {
  return proxyFetch<CheckoutResult>("/storefront/checkout", { method: "POST", body: { addressId, note, paymentProvider, deliveryOptionId } });
}

// ---- Payment Gateway ----

export interface InitPaymentData {
  gatewayUid: string;
  orderId: string;
  amount: string;
  currency?: string;
  returnUrl: string;
  failUrl: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  basket?: Array<{ name: string; price: number; quantity: number }>;
}

export interface InitPaymentResult {
  success: boolean;
  redirectUrl?: string;
  gatewayTransactionId?: string;
  error?: string;
}

export async function initPayment(data: InitPaymentData): Promise<InitPaymentResult> {
  return proxyFetch<InitPaymentResult>("/storefront/checkout/pay/init", { method: "POST", body: data });
}

export async function getPaymentStatus(orderId: string): Promise<{ status: string }> {
  return proxyFetch<{ status: string }>(`/storefront/checkout/pay/status/${orderId}?wait=1`);
}

// ---- Carrier Rates ----

export interface CarrierRate {
  service?: string;
  name?: string;
  price?: number;
  totalPrice?: number;
}

// "calculated" fiyatlı kargolar için anlık fiyat sorgusu. Yanıt sağlayıcıya göre
// değişebildiğinden toleranslı parse edilir; hata/boş yanıt null döner.
export async function getCarrierRates(data: {
  gatewayUid: string;
  items: { variantId: string; quantity: number }[];
  price: number;
}): Promise<number | null> {
  try {
    const res = await proxyFetch<CarrierRate[] | { rates?: CarrierRate[] } | CarrierRate>(
      "/storefront/checkout/carrier/rates",
      { method: "POST", body: data }
    );
    const rates: CarrierRate[] = Array.isArray(res)
      ? res
      : Array.isArray((res as { rates?: CarrierRate[] }).rates)
        ? (res as { rates: CarrierRate[] }).rates
        : [res as CarrierRate];
    const prices = rates
      .map((r) => r.price ?? r.totalPrice)
      .filter((p): p is number => typeof p === "number" && p >= 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  } catch {
    return null;
  }
}

// ---- Addresses ----

export interface AddressItem {
  uid: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  addressType: "shipping" | "billing";
  isDefault: boolean;
}

export interface CreateAddressInput {
  title?: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
  addressType?: "shipping" | "billing";
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  addressType?: "shipping" | "billing";
  isDefault?: boolean;
}

export async function getAddresses(): Promise<AddressItem[]> {
  try {
    return await proxyFetch<AddressItem[]>("/storefront/address");
  } catch {
    return [];
  }
}

export async function createAddress(data: CreateAddressInput): Promise<AddressItem> {
  return proxyFetch<AddressItem>("/storefront/address", { method: "POST", body: data });
}

export async function updateAddress(uid: string, data: UpdateAddressInput): Promise<AddressItem> {
  return proxyFetch<AddressItem>(`/storefront/address/${uid}`, { method: "PATCH", body: data });
}

export async function deleteAddress(uid: string): Promise<void> {
  try {
    await proxyFetch(`/storefront/address/${uid}`, { method: "DELETE" });
  } catch {}
}

// ---- Profile ----

export interface ProfileData {
  uid: string;
  email: string;
  fullName: string;
  name: string;
  lastName: string;
  phone: string;
  avatar: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export async function getProfile(): Promise<ProfileData | null> {
  try {
    return await proxyFetch<ProfileData>("/storefront/auth/me");
  } catch {
    return null;
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<ProfileData> {
  return proxyFetch<ProfileData>("/storefront/auth/me", { method: "PATCH", body: data });
}

// ---- Favorites ----

export interface FavoriteItem {
  id: number;
  productId: number;
  variantId: number | null;
  createdAt: number;
  product: {
    id: string;
    handle: string;
    title: string;
    subTitle: string | null;
    description: string;
    availableForSale: boolean;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
      maxVariantPrice: { amount: string; currencyCode: string };
    };
    featuredImage: { url: string; altText: string; width: number; height: number } | null;
  } | null;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    return await proxyFetch<FavoriteItem[]>("/storefront/favorites");
  } catch {
    return [];
  }
}

export async function addFavorite(productUid: string, variantUid?: string): Promise<void> {
  try {
    await proxyFetch("/storefront/favorites", {
      method: "POST",
      body: { productId: productUid, variantId: variantUid },
    });
  } catch {}
}

export async function removeFavorite(productUid: string): Promise<void> {
  try {
    await proxyFetch(`/storefront/favorites/${productUid}`, { method: "DELETE" });
  } catch {}
}

// ---- Reviews ----

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  userName: string;
  createdAt: string | number;
}

export interface ReviewsData {
  reviews: ReviewItem[];
  averageRating: number;
  totalCount: number;
}

// Yorumlar statik R2'den (sadece onaylılar publish edilir); yorum YAZMA dinamik API'de kalır.
// Statik snapshot henüz publish edilmemişse (404) dinamik API'ye düşer — GET için JWT gerekmez,
// üye olmayanlar da yorumları görür.
export async function getReviews(productUid: string): Promise<ReviewsData> {
  try {
    const { storefrontDataUrl } = await import("./manifest");
    const res = await fetch(storefrontDataUrl(`reviews/product-${productUid}.json`), {
      next: { revalidate: 3600 },
    });
    if (res.ok) return (await res.json()) as ReviewsData;
  } catch {}
  try {
    const data = await proxyFetch<ReviewsData>(`/storefront/products/${productUid}/reviews`);
    // KVKK: statik snapshot'ta maskeleme publish tarafında yapılıyor; dinamik API tam isim
    // dönerse burada maskele ("Elif Şahin" → "Elif Ş.")
    return {
      ...data,
      reviews: data.reviews.map((r) => ({ ...r, userName: maskUserName(r.userName) })),
    };
  } catch {
    return { reviews: [], averageRating: 0, totalCount: 0 };
  }
}

function maskUserName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  return `${parts.slice(0, -1).join(" ")} ${last.charAt(0).toLocaleUpperCase("tr")}.`;
}

export async function submitReview(
  productUid: string,
  data: { rating: number; title?: string; body?: string }
): Promise<{ id: string }> {
  return proxyFetch<{ id: string }>(`/storefront/products/${productUid}/reviews`, {
    method: "POST",
    body: data,
  });
}

// ---- Coupon ----

export interface CouponApplyResult {
  applied: boolean;
  discountPercent: number | null;
  discountAmount: number | null;
  message?: string;
  campaign: { uid?: string; title?: string; campaignType?: string; couponCode?: string };
}

export async function applyCoupon(code: string): Promise<CouponApplyResult> {
  return proxyFetch<CouponApplyResult>("/storefront/cart/coupon", {
    method: "POST",
    body: { code },
  });
}

// ---- Gift Card ----

export interface GiftCardApplyResult {
  applied: boolean;
  amount: number;
  newBalance: number;
  message?: string;
}

export async function applyGiftCard(code: string): Promise<GiftCardApplyResult> {
  return proxyFetch<GiftCardApplyResult>("/storefront/cart/gift-card", {
    method: "POST",
    body: { code },
  });
}

// ---- Returns / Order Cancel ----

export interface ReturnListItem {
  id: string;
  orderId: string;
  orderUid: string;
  reason: string;
  status: string;
  resolutionType: string | null;
  refundedAmount: number | null;
  createdAt: string;
}

export interface ReturnDetailItemInfo {
  orderItemId: string;
  quantity: number;
  inspectionStatus: string;
  resolvedAmount: number | null;
  product: { uid: string; title: string; slug: string };
}

export interface ReturnDetailData {
  id: string;
  orderId: string;
  orderUid: string;
  reason: string;
  customerNote: string | null;
  adminNote: string | null;
  status: string;
  trackingNumber: string | null;
  resolutionType: string | null;
  refundedAmount: number | null;
  createdAt: string;
  updatedAt: string | null;
  items: ReturnDetailItemInfo[];
}

export async function getReturns(): Promise<ReturnListItem[]> {
  try {
    return await proxyFetch<ReturnListItem[]>("/storefront/returns");
  } catch {
    return [];
  }
}

export async function getReturnDetail(id: string): Promise<ReturnDetailData | null> {
  try {
    return await proxyFetch<ReturnDetailData>(`/storefront/returns/${id}`);
  } catch {
    return null;
  }
}

export async function initiateReturn(
  orderUid: string,
  data: {
    reason: string;
    customerNote?: string;
    items: { orderItemId: string; quantity: number }[];
  }
): Promise<{ id: string }> {
  return proxyFetch<{ id: string }>(`/storefront/orders/${orderUid}/return`, {
    method: "POST",
    body: data,
  });
}

export async function cancelOrder(orderUid: string): Promise<void> {
  await proxyFetch(`/storefront/orders/${orderUid}/cancel`, { method: "POST" });
}

// ---- Password / Account ----

export async function forgotPassword(email: string): Promise<{ message?: string }> {
  return proxyFetch<{ message?: string }>("/storefront/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(token: string, password: string): Promise<{ message?: string }> {
  return proxyFetch<{ message?: string }>("/storefront/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message?: string }> {
  return proxyFetch<{ message?: string }>("/storefront/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

export async function deleteAccount(): Promise<{ message?: string }> {
  return proxyFetch<{ message?: string }>("/storefront/auth/me", { method: "DELETE" });
}

// ---- Contact ----

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function submitContact(data: ContactInput): Promise<{ id: string }> {
  return proxyFetch<{ id: string }>("/storefront/contact", { method: "POST", body: data });
}
