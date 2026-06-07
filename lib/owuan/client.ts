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

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
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
  options: { method?: string; body?: unknown; next?: { revalidate?: number } } = {}
): Promise<T> {
  const url = proxyUrl(endpoint);
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: getAuthHeaders(),
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: options.next,
  });
  const json = (await res.json()) as {
    success: boolean; data: T; error?: string; meta?: unknown;
  };
  if (!json.success) throw new Error(json.error || "API request failed");
  return json.data;
}

// ---- Products ----

import type { Product, Collection, Manifest } from "./types";

export async function getProducts(options?: {
  collection?: string; query?: string; sortKey?: string;
  reverse?: boolean; limit?: number; offset?: number;
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
  const qs = p.toString();
  return proxyFetch<Product[]>(`/storefront/products${qs ? `?${qs}` : ""}`, { next: { revalidate: 30 } });
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

export async function getManifest(): Promise<Manifest> {
  if (cachedManifest && Date.now() - manifestFetchedAt < 5 * 60 * 1000) return cachedManifest;
  const data = await proxyFetch<Manifest>("/storefront/manifest", { next: { revalidate: 300 } });
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
    const cats = m.categories.filter(c => c.isActive);
    if (handle === "header") {
      return cats.slice(0, 7).map(c => ({ title: c.title, path: `/search/${c.slug}` }));
    }
  } catch {}
  return [];
}

// ---- Page (stub) ----

export async function getPage(_handle: string): Promise<undefined> { return undefined; }
export async function getPages(): Promise<[]> { return []; }

// ---- Cart ----

export async function getCart(): Promise<{
  id: string | null;
  items: Array<{
    id: string;
    variantId: number;
    quantity: number;
    price: { amount: string; currencyCode: string };
    compareAtPrice?: { amount: string; currencyCode: string };
  }>;
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
} | null> {
  try {
    return await proxyFetch("/storefront/cart");
  } catch { return null; }
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
