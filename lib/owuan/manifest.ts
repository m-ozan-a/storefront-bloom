// Storefront manifest — Cloudflare R2/Worker'dan tek seferde çekilir (CDN cache).
// Sayfa render edilmeden ÖNCE layout.tsx sunucu tarafında yükler; menü/footer/orta
// içerik aynı veriyle SSR edilir → yükleme aşamasında boş orta / flash olmaz.

function resolveDataUrl(): string {
  // 1) Tam override (manifest.json dahil tam URL)
  if (process.env.NEXT_PUBLIC_STOREFRONT_DATA_URL) {
    return process.env.NEXT_PUBLIC_STOREFRONT_DATA_URL;
  }
  // 2) CDN base + orgId (codegen her deploy'da STORE_SLUG/orgId yazar)
  const cdn = process.env.NEXT_PUBLIC_STOREFRONT_CDN_URL;
  const slug = process.env.NEXT_PUBLIC_STORE_SLUG;
  if (cdn && slug) {
    return `${cdn.replace(/\/$/, "")}/v1/storefront-data/${slug}/manifest.json`;
  }
  // 3) Prod fallback: api.owuan.com CF Worker
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return `https://api.owuan.com/v1/storefront-data/${slug ?? "luna-tekstil"}/manifest.json`;
  }
  // 4) Dev fallback: lokal owuan, api.owuan.com ile aynı public path (auth yok)
  return `http://localhost:3000/v1/storefront-data/${slug ?? "luna-tekstil"}/manifest.json`;
}

const STOREFRONT_DATA_URL = resolveDataUrl();

// manifest.json ile aynı klasördeki diğer statik dosyaların URL'i
// (categories.json, reviews/product-{uid}.json, recommendations/product-{uid}.json ...)
export function storefrontDataUrl(file: string): string {
  return STOREFRONT_DATA_URL.replace(/manifest\.json$/, file);
}

export interface ProductUrls {
  all: string;
  category: string;
  collection: string;
  brand: string;
  label: string;
  campaign: string;
}

export interface StorefrontManifest {
  _meta?: { orgId: string; version: number };
  productUrls?: ProductUrls;
  template?: { sector: string; baseTemplate: string; wrappers: string[] };
  store: {
    name: string;
    description: string | null;
    logo?: string | null;
    favicon?: string | null;
    ogImage?: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    social?: Record<string, string | null>;
    meta?: { title: string | null; description: string | null };
    allowGuestCheckout?: boolean;
    // IBAN ve vergi bilgileri KVKK/güvenlik gereği public manifest'te YOK;
    // havale detayı checkout sırasında API-key'li dinamik API'den alınır.
    bankTransferEnabled?: boolean;
    shopShippingEnabled?: boolean;
    shopShippingName?: string | null;
    shopShippingPrice?: number | null;
  };
  analytics?: {
    gtagId?: string | null;
    googleAnalyticsId?: string | null;
    ga4PropertyId?: string | null;
    facebookPixelId?: string | null;
    tiktokPixelId?: string | null;
    otherPixelId?: string | null;
  };
  // R2'de theme altında tasarım katmanına ait ek alanlar bulunabilir; client
  // yalnızca aşağıdaki görsel/veri alanlarını okur, gerisini yok sayar.
  theme: Record<string, unknown> & {
    colors?: Record<string, string>;
    darkColors?: Record<string, string>;
    fontFamilies?: { heading?: string; sans?: string; mono?: string };
    customCss?: string;
    customHeadHtml?: string;
    announcement?: { text?: string | null; enabled?: boolean } | null;
  };
  // Liste tipleri canlı R2 verisiyle birebir: uid/isActive R2'de YOK (owuan aktif
  // olmayanları publish sırasında filtreler). isActive opsiyonel kaldı — eski
  // `c.isActive !== false` denetimleri alan yokken de doğru çalışır.
  categories: { uid?: string; title: string; slug: string; subTitle?: string; description?: string; image?: string | null; parentId?: string | number | null; isActive?: boolean }[];
  collections: { uid?: string; title: string; slug: string; subTitle?: string; description?: string | null; image?: string | null; isActive?: boolean }[];
  brands: { uid?: string; title: string; slug: string; logo?: string | null; description?: string | null; isActive?: boolean }[];
  labels?: { uid?: string; title: string; slug: string; image?: string | null }[];
  deliveryOptions?: { uid: string; title: string; deliveryFirm?: string | null; deliveryFirmLogo?: string | null; description?: string | null }[];
  paymentOptions?: { uid: string; title: string; description?: string | null }[];
  paymentGateways?: { uid: string; provider: string; name: string; isActive: boolean; isTestMode: boolean }[];
  carrierGateways?: { uid: string; provider: string; name: string; isActive: boolean; isTestMode: boolean }[];
  activeCampaigns?: {
    uid: string;
    title: string;
    slug?: string;
    description?: string | null;
    campaignType: "discount_percent" | "discount_amount" | "buy_x_get_y" | "free_shipping" | "coupon";
    discountPercent?: number | null;
    discountAmount?: number | null;
    minimumOrderAmount?: number | null;
    maximumDiscountAmount?: number | null;
    usageLimit?: number | null;
    usageCount?: number | null;
    startsAt?: number;
    endsAt?: number;
    badgeImage?: string | null;
    bannerImage?: string | null;
  }[];
  pages: {
    slug: string;
    title: string;
    content?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isPublished?: boolean;
  }[];
  brandDna?: Record<string, unknown>;
  updatedAt?: number;
}

export interface NavLink {
  label: string;
  url: string;
  children?: NavLink[];
}

interface RawNavItem {
  title?: string;
  type?: string;
  path?: string;
  slug?: string;
  children?: RawNavItem[];
}

function navUrl(item: RawNavItem): string {
  if (item.path) return item.path;
  if (item.slug) return item.type === "brand" ? `/search?brand=${item.slug}` : `/search/${item.slug}`;
  return "#";
}

function parseNav(items: unknown): NavLink[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((it): it is RawNavItem => !!it && typeof (it as RawNavItem).title === "string")
    .map((it) => ({
      label: it.title as string,
      url: navUrl(it),
      children: Array.isArray(it.children) ? parseNav(it.children) : undefined,
    }));
}

export interface HeaderData {
  storeName: string;
  logo: string | null;
  links: NavLink[];
  announcement: string | null;
  tagline: string | null;
  style: string | null;
  // Spec kontratı (header.json show* bayrakları) — undefined = göster
  showSearch?: boolean;
  showCart?: boolean;
  showAccount?: boolean;
  showWishlist?: boolean;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface FooterData {
  storeName: string;
  description: string | null;
  social: Record<string, string | null>;
  phone: string | null;
  email: string | null;
  address: string | null;
  columns: FooterColumn[];
  collections: { title: string; slug: string }[];
  style: string | null;
}

export function getHeaderData(manifest: StorefrontManifest | null): HeaderData {
  const store = manifest?.store;
  const tagline = manifest?.brandDna?.tagline;
  const navHeader = (manifest?.theme as Record<string, unknown> | undefined)?.navigation as
    | { header?: unknown }
    | undefined;
  // Öncelik: theme.navigation.header → kategorilerden fallback
  let links = parseNav(navHeader?.header);
  if (links.length === 0) {
    const cats = (manifest?.categories ?? []).filter((c) => c.isActive !== false);
    links = [
      { label: "Ana Sayfa", url: "/" },
      ...cats.map((c) => ({ label: c.title, url: `/search/${c.slug}` })),
      { label: "İletişim", url: "/content/contact" },
    ];
  }
  return {
    storeName: store?.name ?? "Mağaza",
    logo: store?.logo ?? null,
    links,
    announcement:
      manifest?.theme?.announcement?.enabled && typeof manifest.theme.announcement.text === "string"
        ? manifest.theme.announcement.text
        : null,
    tagline: typeof tagline === "string" ? tagline : null,
    style: typeof (manifest?.theme as Record<string, unknown> | undefined)?.headerStyle === "string"
      ? (manifest?.theme as Record<string, unknown>).headerStyle as string
      : null,
  };
}

export function getFooterData(manifest: StorefrontManifest | null): FooterData {
  const store = manifest?.store;
  // Kolonlar: yayınlanmış içerik sayfalarından kurumsal kolon üretilir;
  // footer içeriğinin tamamı codegen ile wrapper içine yazıldığında bu yalnızca fallback'tir.
  const pages = (manifest?.pages ?? []).filter((pg) => pg.isPublished !== false);
  const columns: FooterColumn[] =
    pages.length > 0
      ? [{
          title: "Kurumsal",
          links: pages.map((pg) => ({ label: pg.title, url: `/content/${pg.slug}` })),
        }]
      : [];
  return {
    storeName: store?.name ?? "Mağaza",
    description: store?.description ?? null,
    social: store?.social ?? {},
    phone: store?.phone ?? null,
    email: store?.email ?? null,
    address: store?.address ?? null,
    columns,
    collections: (manifest?.collections ?? [])
      .filter((c) => c.isActive !== false)
      .map((c) => ({ title: c.title, slug: c.slug })),
    style: typeof (manifest?.theme as Record<string, unknown> | undefined)?.footerStyle === "string"
      ? (manifest?.theme as Record<string, unknown>).footerStyle as string
      : null,
  };
}

export async function getStorefrontManifest(): Promise<StorefrontManifest | null> {
  try {
    const res = await fetch(STOREFRONT_DATA_URL, { next: { revalidate: 3600, tags: ["manifest"] } });
    if (!res.ok) return null;
    // Statik R2 yanıtı düz JSON; dinamik fallback { success, data } sarmalı döner.
    const json = (await res.json()) as StorefrontManifest & { success?: boolean; data?: StorefrontManifest };
    return json.data ?? json;
  } catch {
    return null;
  }
}
