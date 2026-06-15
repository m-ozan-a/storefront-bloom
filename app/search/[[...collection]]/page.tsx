import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts, getProductCount, getCollection, sorting, getManifest } from '@/lib/owuan';
import { ProductGrid } from '@/components/product';
import { FilterSortBar, ProductPagination, PAGE_SIZE, CollectionSidebar, type FilterOptions } from '@/components/search';

interface SearchPageProps {
  params: Promise<{ collection?: string[] }>;
  searchParams: Promise<{
    q?: string; sort?: string; page?: string;
    category?: string; brand?: string;
    minPrice?: string; maxPrice?: string;
    size?: string; color?: string;
  }>;
}

async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const manifest = await getManifest();
    const categories = manifest.categories
      .filter((c) => c.isActive)
      .map((c) => ({ label: c.title, value: c.slug }));
    const brands = manifest.brands
      .filter((b) => b.isActive)
      .map((b) => ({ label: b.title, value: b.slug }));

    return {
      categories,
      brands,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Navy", "Burgundy", "Beige", "Green", "Blue", "Red", "Pink"],
      priceRange: { min: 0, max: 500 },
    };
  } catch {
    return {
      categories: [],
      brands: [],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Navy", "Burgundy", "Beige", "Green", "Blue", "Red", "Pink"],
      priceRange: { min: 0, max: 500 },
    };
  }
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
      title: `Search: ${q} | Owuan`,
      description: `Search results for "${q}"`,
    };
  }

  if (collectionHandle) {
    const collectionData = await getCollection(collectionHandle);
    if (collectionData) {
      return {
        title: `${collectionData.title} | Owuan`,
        description: collectionData.description,
      };
    }
  }

  return {
    title: 'Shop All | Owuan',
    description: 'Browse our complete collection of women\'s fashion',
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
  page,
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
  page: number;
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
      limit: PAGE_SIZE,
      offset,
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
    }),
  ]);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? 'product' : 'products'}
      </p>
      <ProductGrid products={products} columns={3} />
      <ProductPagination total={total} />
    </>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { collection } = await params;
  const { q, sort, page, category, brand, minPrice, maxPrice, size, color } = await searchParams;
  const collectionHandle = collection?.[0];
  const currentPage = Math.max(1, Number(page || 1));

  const [collectionData, filterOptions] = await Promise.all([
    collectionHandle ? getCollection(collectionHandle) : null,
    getFilterOptions(),
  ]);

  const pageTitle = q
    ? `Search: "${q}"`
    : collectionData?.title || 'All Products';

  const pageDescription = collectionData?.description;

  const categoryArr = category?.split(",").filter(Boolean);
  const brandArr = brand?.split(",").filter(Boolean);
  const sizeArr = size?.split(",").filter(Boolean);
  const colorArr = color?.split(",").filter(Boolean);
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
                maxPrice={maxPriceNum}
                minPrice={minPriceNum}
                page={currentPage}
                query={q}
                size={sizeArr}
                sort={sort}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
