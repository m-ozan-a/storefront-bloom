import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchCatalog } from '@/actions';
import { getStorefrontManifest } from '@/actions';
import { ProductGrid } from '@/components/product';
import { ProductCard } from '@/components/product/product-card';
import { FilterSortBar, ProductPagination, CollectionSidebar, type FilterOptions } from '@/components/search';
import { parseOptionParam, PAGE_SIZE } from '@/lib/filter-params';

interface SearchPageProps {
  params: Promise<{ collection?: string[] }>;
  searchParams: Promise<{
    q?: string; sort?: string; page?: string;
    category?: string; brand?: string;
    minPrice?: string; maxPrice?: string;
    opt?: string; label?: string;
  }>;
}

export const revalidate = 3600;

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

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { collection } = await params;
  const { q, sort, page, category, brand, minPrice, maxPrice, opt, label } = await searchParams;
  const collectionHandle = collection?.[0];
  const currentPage = Math.max(1, Number(page || 1));

  const manifest = await getStorefrontManifest();

  const listingStyle = (manifest?.theme?.listingPageStyle as string) || "grid";
  const gridColumns = (manifest?.theme?.productGridColumns as number) || 3;
  const productCardStyle = ((manifest?.theme?.productCardStyle as string) || "classic") as "classic" | "modern" | "minimal";

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

  const { products, total, facets } = await searchCatalog({
    q,
    slug: collectionHandle,
    category: category?.split(",").filter(Boolean),
    brand: brand?.split(",").filter(Boolean),
    label: label?.split(",").filter(Boolean),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    options: parseOptionParam(opt),
    sort,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const filterOptions: FilterOptions = {
    categories: facets.categories,
    brands: facets.brands,
    optionGroups: facets.optionGroups,
    priceRange: facets.priceRange,
  };

  const results = (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{total} ürün</p>
      {listingStyle === "masonry" ? (
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {products.map((product) => (
            <div key={product.id} className="mb-4 break-inside-avoid">
              <ProductCard product={product} cardStyle={productCardStyle} />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} columns={(listingStyle === "list" ? 1 : gridColumns) as 1 | 2 | 3 | 4} cardStyle={productCardStyle} />
      )}
      <Suspense fallback={null}>
        <ProductPagination total={total} />
      </Suspense>
    </>
  );

  return (
    <main className="px-5 pt-5 pb-5">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="font-serif text-xl font-bold text-foreground">
          {pageTitle}
        </h1>
        {pageDescription ? (
          <p className="mt-2 text-muted-foreground">{pageDescription}</p>
        ) : null}
      </div>

      {listingStyle === "list" || listingStyle === "masonry" ? (
        <div>
          <Suspense fallback={null}>
            <FilterSortBar filterOptions={filterOptions} />
          </Suspense>
          <div className="mt-6">{results}</div>
        </div>
      ) : (
        <div className="flex gap-12">
          <CollectionSidebar currentCollection={collectionHandle} />
          <div className="flex-1">
            <Suspense fallback={null}>
              <FilterSortBar filterOptions={filterOptions} />
            </Suspense>
            <div className="mt-6">{results}</div>
          </div>
        </div>
      )}
    </main>
  );
}
