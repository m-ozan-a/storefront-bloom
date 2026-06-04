import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts, getCollection, sorting } from '@/lib/owuan';
import { ProductGrid } from '@/components/product';
import { FilterSortBar, CollectionSidebar } from '@/components/search';

interface SearchPageProps {
  params: Promise<{ collection?: string[] }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
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
}: {
  collection?: string;
  query?: string;
  sort?: string;
}) {
  const sortOption = sorting.find((s) => s.slug === sort);

  const products = await getProducts({
    collection,
    query,
    sortKey: sortOption?.sortKey,
    reverse: sortOption?.reverse,
  });

  return (
    <div className="flex-1">
      <FilterSortBar productCount={products.length} />
      <div className="mt-6">
        <ProductGrid products={products} columns={3} />
      </div>
    </div>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { collection } = await params;
  const { q, sort } = await searchParams;
  const collectionHandle = collection?.[0];

  const collectionData = collectionHandle
    ? await getCollection(collectionHandle)
    : null;

  const pageTitle = q
    ? `Search: "${q}"`
    : collectionData?.title || 'All Products';

  const pageDescription = collectionData?.description;

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

        <Suspense
          fallback={
            <div className="flex-1">
              <div className="h-10 w-full animate-pulse bg-secondary" />
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse bg-secondary" />
                ))}
              </div>
            </div>
          }
        >
          <ProductResults
            collection={collectionHandle}
            query={q}
            sort={sort}
          />
        </Suspense>
      </div>
    </main>
  );
}
