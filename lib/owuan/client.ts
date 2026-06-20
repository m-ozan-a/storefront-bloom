// Owuan Storefront API Client
// All requests go through /api/proxy/[...] to keep OWUAN_STORE_API_KEY server-only

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
  options: { method?: string; body?: unknown; next?: { revalidate?: number }; headers?: Record<string, string> } = {}
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
  const qs = p.toString();
  return proxyFetch<Product[]>(`/storefront/products${qs ? `?${qs}` : ""}`, { next: { revalidate: 30 } });
}

export async function getProductCount(options?: {
  collection?: string; query?: string;
  category?: string[]; brand?: string[];
  minPrice?: number; maxPrice?: number;
  size?: string[]; color?: string[];
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
  const qs = p.toString();
  return proxyFetch<{ count: number }>(`/storefront/products/count${qs ? `?${qs}` : ""}`, { next: { revalidate: 30 } })
    .then((d) => d.count)
    .catch(() => 0);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    return await proxyFetch<Product>(`/storefront/products/${handle}`, { next: { revalidate: 60 } });
  } catch { return undefined; }
}

export async function getProductById(_id: string): Promise<Product | undefined> {
  return undefined; // Not implemented — use getProduct(handle) instead
}

export async function getProductRecommendations(_productId: string): Promise<Product[]> {
  return proxyFetch<Product[]>(`/storefront/products?limit=4`);
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

export async function getPage(slug: string): Promise<Page | null> {
  return proxyFetch<Page>(`/storefront/pages/${slug}`);
}

export async function getPages(): Promise<Page[]> {
  const data = await proxyFetch<Page[]>("/storefront/pages");
  return Array.isArray(data) ? data : [];
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
    featuredImage: { url: string; altText: string } | null;
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
  variantUid: string,
  quantity = 1
): Promise<{ success: boolean; message?: string; error?: string }> {
  return proxyFetch("/storefront/cart/items", {
    method: "POST",
    body: { variantId: variantUid, quantity },
  });
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

// ---- Carrier Rates ----

export async function getCarrierRates(data: { gatewayUid: string; items: unknown[]; price: number }) {
  return proxyFetch("/storefront/checkout/carrier/rates", { method: "POST", body: data });
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
