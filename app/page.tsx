import { getStaticProducts } from "@/actions";
import { getStorefrontManifest } from "@/actions";
import { BloomHero } from "@/components/sections/bloom-hero";
import { BloomEditorial } from "@/components/sections/bloom-editorial";
import { BloomCollectionShowcase } from "@/components/sections/bloom-collection-showcase";
import { BloomTestimonials } from "@/components/sections/bloom-testimonials";
import { BloomNewsletter } from "@/components/sections/bloom-newsletter";
import { ProductCard } from "@/components/product";
import type { Product } from "@/lib/owuan/types";

export const revalidate = 3600;

export default async function HomePage() {
  const [manifest, products] = await Promise.all([
    getStorefrontManifest(),
    getStaticProducts(undefined, { limit: 8, revalidate: 3600 }).catch(() => [] as Product[]),
  ]);

  const storeName = manifest?.store?.name || "Essentials";

  const collectionItems = (manifest?.collections ?? [])
    .filter((c) => c.isActive !== false)
    .slice(0, 3)
    .map((c, i) => ({
      title: c.title,
      slug: c.slug,
      imageUrl:
        c.image ??
        [
          "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/NanoBanana-2026-02-04-01KGMCGE8HA4MP3JQAJ1PAEGGX.png",
          "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/NanoBanana-2026-02-04-1--01KGMCJ09NGECFMM8QVAY13MY3.png",
          "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/Gro-nano_banana_pro_20260204_133831_1--01KGMCNPB3SC30ZKSH1ZPWX149.jpeg",
        ][i] ?? "",
    }));

  const cardStyle = ((manifest?.theme?.productCardStyle as string) || "classic") as
    | "classic"
    | "modern"
    | "minimal";

  return (
    <main>
      <BloomHero storeName={storeName} />

      <div className="relative z-20 bg-background">
        {/* Featured Products Grid */}
        {products.length > 0 ? (
          <section className="pt-16 pb-24">
            <div className="content-container">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-serif)] font-semibold text-foreground mb-4 tracking-tight">
                  Elevated essentials for everyday.
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Functional athleisure made of premium materials to improve your life in small but mighty ways.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cardStyle={cardStyle}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Lifestyle Editorial */}
        <BloomEditorial
          title="Built for the in-between"
          description="Essentials is built for the in-between moments — the walk to the studio, the coffee after training, the quiet hours at home."
          ctaText="Our Story"
          ctaHref="/content/about"
          imageUrl="https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/nano_banana_pro_20260204_141238_1-01KGMCQQ1KXNTY3K55VA3T84KE.png"
        />

        {/* Collection Showcase */}
        {collectionItems.length > 0 ? (
          <BloomCollectionShowcase collections={collectionItems} />
        ) : null}

        {/* Video & Testimonials */}
        <BloomTestimonials />

        {/* Newsletter */}
        <BloomNewsletter />
      </div>
    </main>
  );
}
