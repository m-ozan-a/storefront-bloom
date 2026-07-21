// Katalog motoru — statik products.json (R2/CDN) üzerinde in-memory arama,
// filtreleme, facet üretimi, sıralama ve sayfalama. Dinamik API'ye gitmez.
// Varyant option facet'leri (Renk/Beden vb.) variants[].selectedOptions
// alanından üretilir; alan snapshot'ta yoksa o facet grubu render edilmez.

import { getStaticProductRows, rowToProduct, type StorefrontProductRow } from "./static-products";
import type { Product } from "./types";

export interface CatalogQuery {
  q?: string;
  slug?: string;
  category?: string[];
  brand?: string[];
  label?: string[];
  minPrice?: number;
  maxPrice?: number;
  options?: Record<string, string[]>;
  sort?: string | null;
  page?: number;
  pageSize?: number;
}

export interface OptionGroup {
  name: string;
  values: string[];
}

export interface CatalogFacets {
  categories: { label: string; value: string }[];
  brands: { label: string; value: string }[];
  optionGroups: OptionGroup[];
  priceRange: { min: number; max: number };
}

export interface CatalogResult {
  products: Product[];
  total: number;
  facets: CatalogFacets;
}

function minPriceOf(row: StorefrontProductRow): number {
  return parseFloat(row.priceRange.minVariantPrice.amount) || 0;
}

function matchesText(row: StorefrontProductRow, q: string): boolean {
  const needle = q.toLocaleLowerCase("tr");
  const haystack = [
    row.title,
    row.subTitle ?? "",
    row.brand ?? "",
    ...row.categories.map((c) => c.title),
    ...(row.collections ?? []).map((c) => c.title),
    ...row.labels.map((l) => l.title),
  ]
    .join(" ")
    .toLocaleLowerCase("tr");
  return needle.split(/\s+/).every((w) => haystack.includes(w));
}

function matchesSlug(row: StorefrontProductRow, slug: string): boolean {
  return (
    row.categories.some((c) => c.slug === slug) ||
    (row.collections ?? []).some((c) => c.slug === slug)
  );
}

function matchesOptions(row: StorefrontProductRow, options: Record<string, string[]>): boolean {
  const entries = Object.entries(options).filter(([, vals]) => vals.length > 0);
  if (entries.length === 0) return true;
  return row.variants.some((v) => {
    const selected = v.selectedOptions ?? [];
    return entries.every(([name, vals]) =>
      selected.some((o) => o.name === name && vals.includes(o.value))
    );
  });
}

function applyFilters(rows: StorefrontProductRow[], query: CatalogQuery): StorefrontProductRow[] {
  return rows.filter((row) => {
    if (query.q && !matchesText(row, query.q)) return false;
    if (query.slug && !matchesSlug(row, query.slug)) return false;
    if (query.category?.length && !row.categories.some((c) => query.category!.includes(c.slug))) return false;
    if (query.brand?.length && !(row.brand && query.brand.includes(row.brand))) return false;
    if (query.label?.length && !row.labels.some((l) => query.label!.includes(l.slug))) return false;
    const price = minPriceOf(row);
    if (query.minPrice != null && price < query.minPrice) return false;
    if (query.maxPrice != null && price > query.maxPrice) return false;
    if (query.options && !matchesOptions(row, query.options)) return false;
    return true;
  });
}

function applySort(rows: StorefrontProductRow[], sort?: string | null): StorefrontProductRow[] {
  const sorted = [...rows];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => minPriceOf(a) - minPriceOf(b));
    case "price-desc":
      return sorted.sort((a, b) => minPriceOf(b) - minPriceOf(a));
    case "latest":
      return sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    case "trending":
      return sorted.sort((a, b) => Number(b.isBestseller ?? false) - Number(a.isBestseller ?? false));
    default:
      return sorted;
  }
}

export function buildFacets(rows: StorefrontProductRow[]): CatalogFacets {
  const categories = new Map<string, string>();
  const brands = new Set<string>();
  const optionGroups = new Map<string, Set<string>>();
  let min = Infinity;
  let max = 0;

  for (const row of rows) {
    for (const c of row.categories) categories.set(c.slug, c.title);
    if (row.brand) brands.add(row.brand);
    const price = minPriceOf(row);
    if (price < min) min = price;
    if (price > max) max = price;
    for (const v of row.variants) {
      for (const o of v.selectedOptions ?? []) {
        if (!optionGroups.has(o.name)) optionGroups.set(o.name, new Set());
        optionGroups.get(o.name)!.add(o.value);
      }
    }
  }

  return {
    categories: [...categories].map(([value, label]) => ({ label, value })),
    brands: [...brands].map((b) => ({ label: b, value: b })),
    optionGroups: [...optionGroups].map(([name, values]) => ({ name, values: [...values] })),
    priceRange: { min: min === Infinity ? 0 : Math.floor(min), max: Math.ceil(max) },
  };
}

export async function searchCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const rows = await getStaticProductRows();
  const facets = buildFacets(rows);
  const filtered = applySort(applyFilters(rows, query), query.sort);
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 12;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    products: paged.map(rowToProduct),
    total: filtered.length,
    facets,
  };
}
