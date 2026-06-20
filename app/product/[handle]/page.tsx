import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProduct, getProductRecommendations, getManifest } from '@/lib/owuan';
import { ProductGallery, ProductInfo, ProductGrid } from '@/components/product';
import { cn } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found | Owuan',
    };
  }

  return {
    title: `${product.title} | Owuan`,
    description: product.description,
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      images: product.featuredImage ? [
        {
          url: product.featuredImage.url,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
          alt: product.featuredImage.altText,
        },
      ] : [],
    },
  };
}

async function RecommendedProducts({ productId }: { productId: string }) {
  const recommendations = await getProductRecommendations(productId);

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-16">
      <h2 className="mb-8 text-2xl font-serif font-bold text-foreground">
        You May Also Like
      </h2>
      <ProductGrid products={recommendations} columns={4} />
    </section>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const [product, manifest] = await Promise.all([
    getProduct(handle),
    getManifest().catch(() => null),
  ]);

  if (!product) {
    notFound();
  }

  const layout = manifest?.activeTheme?.productPageStyle || "gallery-left";

  const productGallery = <ProductGallery images={product.images} />;
  const productInfo = <ProductInfo product={product} />;

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      {/* Product Detail Section */}
      {layout === "stacked" ? (
        <div className="space-y-8">
          {productGallery}
          {productInfo}
        </div>
      ) : layout === "minimal" ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
          {productGallery}
          {productInfo}
        </div>
      ) : layout === "gallery-right" ? (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {productInfo}
          {productGallery}
        </div>
      ) : (
        /* gallery-left (default) */
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {productGallery}
          {productInfo}
        </div>
      )}

      {/* Product Description */}
      <section className="mt-16 border-t border-border pt-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Details</h2>
        <div
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </section>

      {/* Recommendations */}
      <Suspense fallback={<div className="mt-16 h-96 animate-pulse bg-secondary" />}>
        <RecommendedProducts productId={product.id} />
      </Suspense>
    </main>
  );
}
