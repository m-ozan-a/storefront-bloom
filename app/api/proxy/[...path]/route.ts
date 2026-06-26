import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_OWUAN_API_URL || "https://app.owuan.com";
const STORE_API_KEY = process.env.OWUAN_STORE_API_KEY || "";
const WORKER_URL = process.env.STOREFRONT_WORKER_URL || "https://owuan-storefront-proxy.anarcheist.workers.dev";

// R2/CDN'den okunabilen statik endpoint'ler (cache-friendly)
const STATIC_MANIFEST_PATH = "storefront/static-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "POST");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "DELETE");
}

async function proxyRequest(req: NextRequest, path: string, method: string) {
  if (method === "GET" && path === "storefront/manifest") {
    const r2 = await tryR2CachedManifest();
    if (r2) {
      return await mergeGatewaysFromApi(r2);
    }
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const targetUrl = `${API_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Store-API-Key": STORE_API_KEY,
  };

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const domain = req.headers.get("x-store-domain");
  if (domain) {
    headers["X-Store-Domain"] = domain;
  }

  try {
    const fetchOptions: RequestInit = { method, headers };

    if (method !== "GET" && method !== "DELETE") {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Proxy request failed" },
      { status: 502 }
    );
  }
}

async function tryR2CachedManifest(): Promise<NextResponse | null> {
  const storeSlug = process.env.NEXT_PUBLIC_STORE_SLUG;
  if (!storeSlug) return null;

  // 1. Önce Cloudflare Worker'dan (R2 edge cache) dene
  try {
    const workerRes = await fetch(
      `${WORKER_URL}/v1/storefront-data/${storeSlug}`,
      {
        next: { revalidate: 3600, tags: [storeSlug] },
      }
    );
    if (workerRes.ok) {
      const data = await workerRes.json();
      return NextResponse.json({ success: true, data: convertStaticToManifest(data, storeSlug) });
    }
  } catch {}

  // 2. Fallback: owuan API üzerinden R2'den oku
  try {
    const apiRes = await fetch(
      `${API_URL}/api/storefront/static-data/${storeSlug}`,
      {
        headers: { "X-Store-API-Key": STORE_API_KEY },
        next: { revalidate: 3600, tags: [storeSlug] },
      }
    );
    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json({ success: true, data: convertStaticToManifest(data, storeSlug) });
    }
  } catch {}

  return null;
}

async function mergeGatewaysFromApi(r2Response: NextResponse): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_URL}/api/storefront/manifest`, {
      headers: { "X-Store-API-Key": STORE_API_KEY },
    });
    if (res.ok) {
      const apiData = await res.json();
      const apiManifest = apiData.data;
      const r2Json = await r2Response.clone().json();
      r2Json.data.paymentGateways = apiManifest.paymentGateways || [];
      r2Json.data.carrierGateways = apiManifest.carrierGateways || [];
      return NextResponse.json(r2Json);
    }
  } catch {}
  return r2Response;
}

// R2 static JSON'u manifest formatına dönüştür
function convertStaticToManifest(data: Record<string, unknown>, storeSlug: string): Record<string, unknown> {
  const store = (data.store as Record<string, unknown>) || {};
  const analytics = (data.analytics as Record<string, unknown>) || {};
  const social = (store.social as Record<string, unknown>) || {};
  const meta = (store.meta as Record<string, unknown>) || {};

  return {
    store: {
      name: store.name,
      domain: storeSlug,
      description: store.description,
      logoUrl: store.logo,
      favicon: store.favicon,
      ogImage: store.ogImage,
      address: store.address,
      phone: store.phone,
      email: store.email,
      gtagId: analytics.gtagId,
      facebookPixelId: analytics.facebookPixelId,
      googleAnalyticsId: analytics.googleAnalyticsId,
      tiktokPixelId: analytics.tiktokPixelId,
      otherPixelId: analytics.otherPixelId,
      ga4PropertyId: analytics.ga4PropertyId,
      metaTitle: meta.title,
      metaDescription: meta.description,
      storeType: "b2c",
      template: "default",
      taxtNumber: store.taxNumber || null,
      taxtOffice: store.taxOffice || null,
      mersisNumber: null,
      kepNumber: null,
      defaultPaymentGateway: null,
      defaultCarrierGateway: null,
      allowGuestCheckout: store.allowGuestCheckout || false,
      bankTransferEnabled: store.bankTransferEnabled ?? true,
      ibanDetails: store.ibanDetails || null,
      shopShippingEnabled: store.shopShippingEnabled ?? true,
      shopShippingName: store.shopShippingName || null,
      shopShippingPrice: store.shopShippingPrice || null,
      socialInstagram: social.instagram,
      socialFacebook: social.facebook,
      socialTiktok: social.tiktok,
      socialYoutube: social.youtube,
      socialLinkedin: social.linkedin,
    },
    categories: (data.categories as Array<Record<string, unknown>> || []).map((c) => ({
      ...c,
      isActive: true,
      subTitle: "",
      description: "",
      uid: c.slug,
    })),
    collections: (data.collections as Array<Record<string, unknown>> || []).map((c) => ({
      ...c,
      isActive: true,
      subTitle: "",
      description: "",
      uid: c.slug,
    })),
    brands: (data.brands as Array<Record<string, unknown>> || []).map((b) => ({
      ...b,
      isActive: true,
      description: "",
      uid: b.slug,
    })),
    deliveryOptions: [],
    paymentOptions: [],
    paymentGateways: (data.paymentGateways as Array<Record<string, unknown>>) || [],
    carrierGateways: (data.carrierGateways as Array<Record<string, unknown>>) || [],
    guestCheckoutEnabled: store.allowGuestCheckout || false,
    activeCampaigns: [],
    activeTheme: data.theme ? {
      uid: (data.theme as Record<string, unknown>).uid,
      name: (data.theme as Record<string, unknown>).name,
      version: "1.0.0",
      colors: (data.theme as Record<string, unknown>).colors,
      darkColors: (data.theme as Record<string, unknown>).darkColors,
      fontFamilies: (data.theme as Record<string, unknown>).fontFamilies,
      borderRadius: (data.theme as Record<string, unknown>).borderRadius,
      darkModeSupport: (data.theme as Record<string, unknown>).darkModeSupport,
      headerStyle: (data.theme as Record<string, unknown>).headerStyle,
      footerStyle: (data.theme as Record<string, unknown>).footerStyle,
      productCardStyle: (data.theme as Record<string, unknown>).productCardStyle,
      productGridColumns: (data.theme as Record<string, unknown>).productGridColumns,
      productPageStyle: (data.theme as Record<string, unknown>).productPageStyle,
      listingPageStyle: (data.theme as Record<string, unknown>).listingPageStyle,
      customCss: (data.theme as Record<string, unknown>).customCss,
      customHeadHtml: (data.theme as Record<string, unknown>).customHeadHtml,
      components: (data.theme as Record<string, unknown>).components,
      sections: {
        navigation: (data.theme as Record<string, unknown>).navigation,
        announcement: (data.theme as Record<string, unknown>).announcement,
      },
      spec: (data.wrapper as Record<string, unknown>)?.homepageSpec ?? null,
      headerSpec: (data.wrapper as Record<string, unknown>)?.headerSpec ?? null,
      footerSpec: (data.wrapper as Record<string, unknown>)?.footerSpec ?? null,
      productPageSpec: (data.wrapper as Record<string, unknown>)?.productPageSpec ?? null,
      listingSpec: (data.wrapper as Record<string, unknown>)?.listingSpec ?? null,
    } : null,
  };
}
