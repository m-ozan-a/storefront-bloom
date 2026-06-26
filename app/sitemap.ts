import type { MetadataRoute } from "next";
import { getManifest, getProducts, getPages } from "@/lib/owuan";
import { headers } from "next/headers";

async function getDomainHeaders(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const host = h.get("host") || "";
    const domain = host.split(":")[0];
    return { "X-Store-Domain": domain };
  } catch {
    return {};
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domainHeaders = await getDomainHeaders();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

  let manifest;
  try {
    manifest = await getManifest(domainHeaders);
  } catch {
    manifest = null;
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  if (manifest?.categories) {
    for (const cat of manifest.categories) {
      if (cat.isActive) {
        staticPages.push({
          url: `${baseUrl}/search/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  if (manifest?.collections) {
    for (const col of manifest.collections) {
      if (col.isActive) {
        staticPages.push({
          url: `${baseUrl}/search/${col.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  let contentPages: { slug: string; updatedAt: string }[] = [];
  try {
    const pages = await getPages();
    contentPages = pages
      .filter((p) => p.isPublished)
      .map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }));
  } catch {}

  const pageEntries: MetadataRoute.Sitemap = contentPages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: new Date(p.updatedAt || Date.now()),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  let products: { handle: string; updatedAt: string }[] = [];
  try {
    products = await getProducts({ limit: 500 });
  } catch {}

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/urun/${p.handle}`,
    lastModified: new Date(p.updatedAt || Date.now()),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...pageEntries, ...productPages];
}
