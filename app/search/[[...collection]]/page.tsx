import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts, getProductCount, sorting } from '@/lib/owuan';
import { getStorefrontManifest } from '@/lib/owuan/manifest';
import { ProductGrid } from '@/components/product';
import { ProductCard } from '@/components/product/product-card';
import { FilterSortBar, ProductPagination, PAGE_SIZE, CollectionSidebar, type FilterOptions } from '@/components/search';

interface SearchPageProps {
  params: Promise<{ collection?: string[] }>;
  searchParams: Promise<{
    q?: string; sort?: string; page?: string;
    category?: string; brand?: string;
    minPrice?: string; maxPrice?: string;
    size?: string; color?: string; label?: string;
  }>;
}

export const revalidate = 3600;

async function getFilterOptions(): Promise<FilterOptions> {
  const manifest = await getStorefrontManifest();
  return {
    categories: (manifest?.categories ?? [])
      .filter((c) => c.isActive !== false)
      .map((c) => ({ label: c.title, value: c.slug })),
    brands: (manifest?.brands ?? [])
      .filter((b) => b.isActive !== false)
      .map((b) => ({ label: b.title, value: b.slug })),
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Siyah", "Beyaz", "Lacivert", "Bordo", "Bej", "Yeşil", "Mavi", "Kırmızı", "Pembe"],
    priceRange: { min: 0, max: 500 },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { collection } = await params;
  const { q } = await searchParams;
  const collectionHandle = collection?.[0];

  if (q) {
    return {
      title: `"${q}" araması`,
      description: `"${q}" için arama sonuçları`,
    };
  }

  if (collectionHandle) {
    const manifest = await getStorefrontManifest();
    const col = manifest?.collections.find((c) => c.slug === collectionHandle);
    const cat = manifest?.categories.find((c) => c.slug === collectionHandle);
    const title = col?.title || cat?.title;
    if (title) return { title, description: col?.description || undefined };
  }

  return {
    title: 'Tüm Ürünler',
    description: 'Tüm ürün koleksiyonumuzu keşfedin',
  };
}

async function ProductResults({
  collection,
  query,
  sort,
  category,
  brand,
  minPrice,
  maxPrice,
  size,
  color,
  label,
  page,
  listingStyle,
  gridColumns,
}: {
  collection?: string;
  query?: string;
  sort?: string;
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  label?: string[];
  page: number;
  listingStyle: string;
  gridColumns: number;
}) {
  const sortOption = sorting.find((s) => s.slug === sort);
  const offset = (page - 1) * PAGE_SIZE;

  const [products, total] = await Promise.all([
    getProducts({
      collection,
      query,
      sortKey: sortOption?.sortKey,
      reverse: sortOption?.reverse,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      label,
      limit: PAGE_SIZE,
      offset,
      revalidate: 3600,
    }),
    getProductCount({
      collection,
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      label,
    }),
  ]);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} ürün
      </p>
      {listingStyle === "masonry" ? (
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {products.map((product) => (
            <div key={product.id} className="mb-4 break-inside-avoid">
              <ProductCard product={product} cardStyle="minimal" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} columns={(listingStyle === "list" ? 1 : gridColumns) as 1 | 2 | 3 | 4} />
      )}
      <ProductPagination total={total} />
    </>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { collection } = await params;
  const { q, sort, page, category, brand, minPrice, maxPrice, size, color, label } = await searchParams;
  const collectionHandle = collection?.[0];
  const currentPage = Math.max(1, Number(page || 1));

  const [filterOptions, manifest] = await Promise.all([
    getFilterOptions(),
    getStorefrontManifest(),
  ]);

  const listingStyle = (manifest?.theme?.listingPageStyle as string) || "grid";
  const gridColumns = (manifest?.theme?.productGridColumns as number) || 3;

  const collectionData = collectionHandle
    ? manifest?.collections.find((c) => c.slug === collectionHandle)
    : undefined;
  const categoryTitle = collectionHandle
    ? manifest?.categories.find((c) => c.slug === collectionHandle)?.title
    : undefined;

  const pageTitle = q
    ? `"${q}" araması`
    : collectionData?.title || categoryTitle || 'Tüm Ürünler';

  const pageDescription = collectionData?.description ?? undefined;

  const categoryArr = category?.split(",").filter(Boolean);
  const brandArr = brand?.split(",").filter(Boolean);
  const sizeArr = size?.split(",").filter(Boolean);
  const colorArr = color?.split(",").filter(Boolean);
  const labelArr = label?.split(",").filter(Boolean);
  const minPriceNum = minPrice ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
          {pageTitle}
        </h1>
        {pageDescription && (
          <p className="mt-2 text-muted-foreground">{pageDescription}</p>
        )}
      </div>

      {listingStyle === "list" || listingStyle === "masonry" ? (
        /* List or Masonry: no sidebar */
        <div>
          <FilterSortBar filterOptions={filterOptions} />
          <div className="mt-6">
            <Suspense
              fallback={
                <div>
                  <div className="mb-4 h-5 w-24 animate-pulse rounded bg-secondary" />
                  <div className={listingStyle === "masonry" ? "columns-1 gap-4 md:columns-2 lg:columns-3" : "space-y-4"}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={listingStyle === "masonry" ? "mb-4 aspect-[3/4] animate-pulse rounded bg-secondary" : "h-40 animate-pulse rounded bg-secondary"} />
                    ))}
                  </div>
                </div>
              }
            >
              <ProductResults
                brand={brandArr}
                category={categoryArr}
                collection={collectionHandle}
                color={colorArr}
                label={labelArr}
                maxPrice={maxPriceNum}
                minPrice={minPriceNum}
                page={currentPage}
                query={q}
                size={sizeArr}
                sort={sort}
                listingStyle={listingStyle}
                gridColumns={gridColumns}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        /* Grid (default): sidebar + grid */
        <div className="flex gap-12">
          <CollectionSidebar currentCollection={collectionHandle} />

          <div className="flex-1">
            <FilterSortBar filterOptions={filterOptions} />

            <div className="mt-6">
              <Suspense
                fallback={
                  <div>
                    <div className="mb-4 h-5 w-24 animate-pulse rounded bg-secondary" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] animate-pulse rounded bg-secondary" />
                      ))}
                    </div>
                  </div>
                }
              >
                <ProductResults
                  brand={brandArr}
                  category={categoryArr}
                  collection={collectionHandle}
                  color={colorArr}
                  label={labelArr}
                  maxPrice={maxPriceNum}
                  minPrice={minPriceNum}
                  page={currentPage}
                  query={q}
                  size={sizeArr}
                  sort={sort}
                  listingStyle={listingStyle}
                gridColumns={gridColumns}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
