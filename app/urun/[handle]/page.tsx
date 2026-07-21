import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/actions";
import type { Product } from "@/lib/owuan/types";
import { getStorefrontManifest } from "@/actions";
import { getCrossSell, filterByCampaign, type SlimProduct } from "@/actions";
import { ProductGallery, ProductInfo } from "@/components/product";
import { CrossSellGrid, RecommendationGrid } from "@/components/product/cross-sell-section";
import { ProductReviews } from "@/components/product/product-reviews";
import { DeliveryPaymentPanel } from "@/components/product/delivery-payment-panel";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return { title: "Product Not Found" };
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
    await getCrossSell(product.id, "product_detail"),
    hasCampaign
  );

  const layout = (manifest?.theme?.productPageStyle as string) || "gallery-left";

  const productGallery = <ProductGallery images={product.images} />;
  const productInfo = <ProductInfo product={product} />;

  return (
    <main className="w-full content-container py-8">
      {/* Product Detail Section */}
      {layout === "stacked" ? (
        <div className="space-y-6">
          {productGallery}
          {productInfo}
        </div>
      ) : layout === "minimal" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
          {productGallery}
          {productInfo}
        </div>
      ) : layout === "gallery-right" ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {productInfo}
          {productGallery}
        </div>
      ) : (
        /* gallery-left (default) */
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {productGallery}
          {productInfo}
        </div>
      )}

      {/* Product Description + Teslimat/Odeme */}
      <section className="mt-8 grid items-start gap-6 border-t border-border pt-8 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <h2 className="mb-4 text-2xl font-[family-name:var(--font-serif)] font-medium text-foreground">
            Product Details
          </h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description || "" }}
            />
          </div>
        </div>
        <DeliveryPaymentPanel
          deliveryOptions={manifest?.deliveryOptions ?? []}
          paymentOptions={manifest?.paymentOptions ?? []}
        />
      </section>

      {/* Reviews */}
      <ProductReviews productUid={product.id} />

      {/* Cross-sell + Recommendations */}
      <CrossSellGrid items={crossSell} />
      <RecommendationGrid products={recommendations} />
    </main>
  );
}
