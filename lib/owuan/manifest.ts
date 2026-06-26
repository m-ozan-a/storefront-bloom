// Storefront manifest — Cloudflare R2/Worker'dan tek seferde çekilir (CDN cache).
// Sayfa render edilmeden ÖNCE layout.tsx sunucu tarafında yükler; menü/footer/orta
// içerik aynı veriyle SSR edilir → yükleme aşamasında boş orta / flash olmaz.

function resolveDataUrl(): string {
  // 1) Tam override
  if (process.env.NEXT_PUBLIC_STOREFRONT_DATA_URL) {
    return process.env.NEXT_PUBLIC_STOREFRONT_DATA_URL;
  }
  // 2) CDN base + store slug (codegen her deploy'da STORE_SLUG yazar)
  const cdn = process.env.NEXT_PUBLIC_STOREFRONT_CDN_URL;
  const slug = process.env.NEXT_PUBLIC_STORE_SLUG;
  if (cdn && slug) {
    return `${cdn.replace(/\/$/, "")}/v1/storefront-data/${slug}`;
  }
  // 3) Dev fallback (çalışan worker)
  return "https://owuan-storefront-proxy-production.anarcheist.workers.dev/v1/storefront-data/luna-tekstil";
}

const STOREFRONT_DATA_URL = resolveDataUrl();

export interface SpecElement {
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
}

export interface FlatSpec {
  root: string;
  elements: Record<string, SpecElement>;
}

export interface StorefrontManifest {
  template: { sector: string; baseTemplate: string; wrappers: string[] };
  store: {
    name: string;
    description: string | null;
    logo: string | null;
    favicon: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    social: Record<string, string | null>;
    meta: { title: string | null; description: string | null };
  };
  analytics: Record<string, string | null>;
  theme: Record<string, unknown> & {
    colors?: Record<string, string>;
    darkColors?: Record<string, string>;
    fontFamilies?: { heading?: string; sans?: string; mono?: string };
    customCss?: string;
    customHeadHtml?: string;
  };
  categories: { uid: string; title: string; slug: string; image?: string | null; isActive: boolean }[];
  collections: { uid: string; title: string; slug: string; description?: string | null; image?: string | null; isActive: boolean }[];
  brands: { uid: string; title: string; slug: string; isActive: boolean }[];
  pages: { slug: string; title: string }[];
  wrapper: {
    homepageSpec: FlatSpec | null;
    headerSpec: FlatSpec | null;
    footerSpec: FlatSpec | null;
    listingSpec: FlatSpec | null;
    productPageSpec: FlatSpec | null;
  };
  brandDna?: Record<string, unknown>;
  updatedAt?: string;
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
}

function rootProps(spec: FlatSpec | null | undefined): Record<string, unknown> {
  if (!spec?.root) return {};
  return spec.elements?.[spec.root]?.props ?? {};
}

function asLinks(v: unknown): NavLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is { label: string; url: string } =>
      !!x && typeof (x as { label?: unknown }).label === "string" && typeof (x as { url?: unknown }).url === "string")
    .map((x) => ({ label: x.label, url: x.url }));
}

export function getHeaderData(manifest: StorefrontManifest | null): HeaderData {
  const store = manifest?.store;
  const p = rootProps(manifest?.wrapper?.headerSpec);
  const tagline = manifest?.brandDna?.tagline;
  const navHeader = (manifest?.theme as Record<string, unknown> | undefined)?.navigation as
    | { header?: unknown }
    | undefined;
  // Öncelik: theme.navigation.header → headerSpec.links → kategorilerden fallback
  let links = parseNav(navHeader?.header);
  if (links.length === 0) links = asLinks(p.links);
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
    announcement: typeof p.announcement === "string" ? p.announcement : null,
    tagline: typeof tagline === "string" ? tagline : null,
  };
}

export function getFooterData(manifest: StorefrontManifest | null): FooterData {
  const store = manifest?.store;
  const p = rootProps(manifest?.wrapper?.footerSpec);
  const columns: FooterColumn[] = Array.isArray(p.columns)
    ? (p.columns as { title?: string; links?: unknown }[])
        .filter((c) => typeof c?.title === "string")
        .map((c) => ({ title: c.title as string, links: asLinks(c.links) }))
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
  };
}

export async function getStorefrontManifest(): Promise<StorefrontManifest | null> {
  try {
    const res = await fetch(STOREFRONT_DATA_URL, { next: { revalidate: 3600, tags: ["manifest"] } });
    if (!res.ok) return null;
    return (await res.json()) as StorefrontManifest;
  } catch {
    return null;
  }
}
