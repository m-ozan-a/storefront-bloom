import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/owuan';
import type { Product } from '@/lib/owuan/types';
import { getStorefrontManifest } from '@/lib/owuan/manifest';
import { getCrossSell, filterByCampaign, type SlimProduct } from '@/lib/cross-sell';
import { ProductGallery, ProductInfo } from '@/components/product';
import { CrossSellGrid, RecommendationGrid } from '@/components/product/cross-sell-section';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

// İstisna: stok/fiyat kritik → kısa revalidate (60s) + tag'li anlık purge (product:<handle>).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return { title: 'Ürün Bulunamadı' };
  }

  return {
    title: product.title,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const [product, manifest] = await Promise.all([
    getProduct(handle),
    getStorefrontManifest(),
  ]);

  if (!product) {
    notFound();
  }

  const recommendations =
    (product as Product & { recommendations?: SlimProduct[] }).recommendations ?? [];
  const hasCampaign = (product.campaignBadges?.length ?? 0) > 0;
  const crossSell = filterByCampaign(
    await getCrossSell(product.id, 'product_detail'),
    hasCampaign
  );

  const layout = (manifest?.theme?.productPageStyle as string) || "gallery-left";

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
        <h2 className="mb-4 text-xl font-semibold text-foreground">Ürün Detayları</h2>
        <div
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description || '' }}
        />
      </section>

      {/* Cross-sell + Recommendations */}
      <CrossSellGrid items={crossSell} />
      <RecommendationGrid products={recommendations} />
    </main>
  );
}
