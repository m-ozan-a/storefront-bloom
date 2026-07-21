// Statik ürün listeleri — R2 snapshot, api.owuan.com CDN (auth yok, düz JSON array).
// URL'ler manifest.productUrls'ten gelir; {uid} placeholder'ı entity uid ile değiştirilir.
// Statik listede description/images/options YOK — ürün detayı dinamik API'den alınır.

import { getStorefrontManifest, type ProductUrls } from "./manifest";
import type { CampaignBadge, Money, Product } from "./types";

export interface StaticImage {
  url: string;
  altText: string | null;
  blurData?: string | null;
}

export interface StorefrontProductRow {
  id: string;
  handle: string;
  title: string;
  subTitle?: string | null;
  description?: string | null;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  variants: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: Money;
    compareAtPrice?: Money | null;
    selectedOptions?: { name: string; value: string }[];
  }[];
  featuredImage?: StaticImage | null;
  images?: StaticImage[];
  categories: { title: string; slug: string; image?: string | null }[];
  collections?: { title: string; slug: string; image?: string | null }[];
  labels: { title: string; slug: string }[];
  campaignBadges?: CampaignBadge[];
  brand?: string | null;
  vatRate?: number;
  priceIncludesTax?: boolean;
  rating?: number | null;
  reviewCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  updatedAt: number;
}

export type StaticProductFilter = {
  type: Exclude<keyof ProductUrls, "all">;
  uid: string;
};

function toImage(img: StaticImage, fallbackAlt: string) {
  return {
    url: img.url,
    altText: img.altText ?? fallbackAlt,
    width: 800,
    height: 800,
    blurData: img.blurData ?? null,
  };
}

export function rowToProduct(row: StorefrontProductRow): Product {
  const image = row.featuredImage
    ? toImage(row.featuredImage, row.title)
    : { url: "", altText: row.title, width: 0, height: 0 };
  const images = (row.images ?? []).map((img) => toImage(img, row.title));
  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description ?? row.subTitle ?? "",
    descriptionHtml: "",
    availableForSale: row.availableForSale,
    options: [],
    priceRange: row.priceRange,
    variants: row.variants.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      selectedOptions: v.selectedOptions ?? [],
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
    })),
    featuredImage: image,
    images: images.length > 0 ? images : image.url ? [image] : [],
    seo: { title: row.title, description: row.description ?? row.subTitle ?? "" },
    tags: row.labels.map((l) => l.slug),
    updatedAt: new Date(row.updatedAt).toISOString(),
    category: row.categories[0]?.slug ?? "",
    brand: row.brand ?? "",
    isNew: row.isNew ?? false,
    isBestseller: row.isBestseller ?? false,
    campaignBadges: row.campaignBadges,
    labels: row.labels,
    collections: (row.collections ?? []).map((c) => ({ title: c.title, slug: c.slug })),
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? 0,
  };
}

export async function getStaticProductRows(
  filter?: StaticProductFilter,
  options?: { revalidate?: number }
): Promise<StorefrontProductRow[]> {
  const manifest = await getStorefrontManifest();
  const urls = manifest?.productUrls;
  if (!urls) return [];
  const url = filter ? urls[filter.type].replace("{uid}", filter.uid) : urls.all;
  try {
    const res = await fetch(url, {
      next: { revalidate: options?.revalidate ?? 3600, tags: ["products"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as StorefrontProductRow[];
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export async function getStaticProducts(
  filter?: StaticProductFilter,
  options?: { revalidate?: number; limit?: number }
): Promise<Product[]> {
  const rows = await getStaticProductRows(filter, options);
  const sliced = options?.limit ? rows.slice(0, options.limit) : rows;
  return sliced.map(rowToProduct);
}
