import { getProducts } from '@/actions';
import { getStorefrontManifest } from '@/actions';
import { PageShell } from '@/components/page-shell';
import type { CategoryGridItem } from '@/components/sections/category-grid';
import type { Product } from '@/lib/owuan/types';

const DEFAULT_WRAPPERS = ['hero', 'category-banners', 'product-showcase', 'trust-badges', 'newsletter'];

// 1 saatlik ISR; ürün/fiyat değişince owuan /api/revalidate (tag: products) ile anında purge edilir.
export const revalidate = 3600;

export default async function HomePage() {
  const [manifest, products] = await Promise.all([
    getStorefrontManifest(),
    getProducts({ limit: 8, revalidate: 3600 }).catch(() => [] as Product[]),
  ]);

  const categories: CategoryGridItem[] = (manifest?.categories ?? [])
    .filter((c) => c.isActive !== false)
    .map((c) => ({ title: c.title, slug: c.slug, image: c.image ?? null }));

  const wrappers = manifest?.template?.wrappers ?? DEFAULT_WRAPPERS;
  const cardStyle = ((manifest?.theme?.productCardStyle as string) || "classic") as "classic" | "modern" | "minimal";

  return (
    <PageShell
      wrappers={wrappers}
      cardStyle={cardStyle}
      data={{
        storeName: manifest?.store?.name ?? '',
        storeDescription: manifest?.store?.description,
        categories,
        products,
      }}
    />
  );
}
