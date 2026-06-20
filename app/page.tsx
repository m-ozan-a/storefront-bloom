import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Percent, Truck } from 'lucide-react';
import { getProducts, getManifest } from '@/lib/owuan';
import { collections } from '@/lib/owuan/dummy-data';
import { ProductGrid } from '@/components/product';
import { ProductCarouselSection } from '@/components/product/product-carousel-section';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';
import { Button } from '@/components/ui/button';
import {
  HeroSectionRenderer,
  BannerSectionRenderer,
  CarouselSectionRenderer,
} from '@/components/sections/SectionRenderer';
import { SpecSection } from '@/components/sections/SpecSection';
import type { ManifestCampaign, SectionsData } from '@/lib/owuan/types';

async function DynamicProductCarousels({
  items,
}: {
  items: NonNullable<SectionsData["homepage"]>["productCarousels"];
}) {
  if (!items || items.length === 0) return null;

  const carousels = await Promise.all(
    items.map(async (config) => {
      const products = await getProducts({
        collection: config.collection,
        limit: config.maxItems || 8,
      });
      return { ...config, products };
    })
  );

  const validCarousels = carousels.filter((c) => c.products.length > 0);
  if (validCarousels.length === 0) return null;

  return <ProductCarouselSection carousels={validCarousels} />;
}
import { Suspense } from 'react';

function getCampaignIcon(type: string) {
  switch (type) {
    case 'discount_percent':
    case 'discount_amount':
      return <Percent className="h-5 w-5" />;
    case 'free_shipping':
      return <Truck className="h-5 w-5" />;
    default:
      return <Percent className="h-5 w-5" />;
  }
}

function CampaignBanner({ campaign }: { campaign: ManifestCampaign }) {
  let label = '';
  switch (campaign.campaignType) {
    case 'discount_percent':
      label = `%${campaign.discountPercent} İndirim`;
      break;
    case 'discount_amount':
      label = `₺${campaign.discountAmount} İndirim`;
      break;
    case 'free_shipping':
      label = 'Ücretsiz Kargo';
      break;
    case 'buy_x_get_y':
      label = campaign.title;
      break;
    default:
      label = campaign.title;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
        {getCampaignIcon(campaign.campaignType)}
      </div>
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{campaign.title}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const newArrivals = await getProducts({ collection: 'new-arrivals' });
  const bestsellers = await getProducts({ collection: 'bestsellers' });
  let activeCampaigns: ManifestCampaign[] = [];
  let components: Record<string, boolean> = {};
  let sections: SectionsData | null = null;
  let homepageSpec: unknown = null;
  try {
    const manifest = await getManifest();
    activeCampaigns = manifest.activeCampaigns || [];
    components = manifest.activeTheme?.components || {};
    sections = manifest.activeTheme?.sections || null;
    homepageSpec = manifest.activeTheme?.spec ?? null;
  } catch {}

  const show = (key: string) => components[key] !== false;
  const heroData = sections?.homepage?.hero;
  const bannerData = sections?.homepage?.banners;
  const carouselData = sections?.homepage?.carousels;
  const productCarouselData = sections?.homepage?.productCarousels;

  if (homepageSpec != null) {
    return (
      <main>
        {show('campaigns') && activeCampaigns.length > 0 && (
          <section className="container mx-auto px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCampaigns.slice(0, 3).map((campaign) => (
                <CampaignBanner key={campaign.uid} campaign={campaign} />
              ))}
            </div>
          </section>
        )}
        <SpecSection spec={homepageSpec} />
        {show('newsletter') && (
          <section className="border-t border-border py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                  Join the Owuan World
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Subscribe to receive updates on new arrivals, exclusive offers, and styling inspiration.
                </p>
                <div className="mt-8">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main>
      {/* Hero Section — eski yöntem (spec yokken) */}
      {show('hero') && heroData ? (
        <HeroSectionRenderer data={heroData} />
      ) : show('hero') ? (
      <section className="relative h-screen min-h-[600px]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop"
            alt="Elegant woman in modern fashion"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </div>
        <div className="relative container mx-auto flex h-full items-center px-4">
          <div className="max-w-xl">
            <span className="text-sm font-medium uppercase tracking-widest text-background/90">
              New Collection
            </span>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-background md:text-6xl lg:text-7xl text-balance">
              Timeless elegance for the modern woman
            </h1>
            <p className="mt-6 text-lg text-background/90 max-w-md">
              Discover our curated collection of sophisticated pieces designed for contemporary living.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/search/new-arrivals">Shop New Arrivals</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 border-background text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/search">Explore Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {show('campaigns') && activeCampaigns.length > 0 && (
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.slice(0, 3).map((campaign) => (
              <CampaignBanner key={campaign.uid} campaign={campaign} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {show('categories') && (
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Explore our carefully curated collections for every occasion
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.slice(2, 8).map((collection, index) => (
            <Link
              key={collection.handle}
              href={collection.path}
              className={`group relative overflow-hidden ${
                index === 0 ? 'md:row-span-2' : ''
              }`}
            >
              <div
                className={`relative ${
                  index === 0 ? 'aspect-[3/4] md:aspect-auto md:h-full' : 'aspect-[4/3]'
                }`}
              >
                {collection.image && (
                  <Image
                    src={collection.image.url}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <h3 className="font-serif text-2xl font-bold text-background">
                    {collection.title}
                  </h3>
                  <span className="mt-2 flex items-center gap-1 text-sm font-medium text-background/90 transition-transform group-hover:translate-x-1">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* New Arrivals */}
      {show('newArrivals') && (
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Just In
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/search/new-arrivals"
              className="hidden items-center gap-1 text-sm font-medium text-foreground hover:underline sm:flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={newArrivals.slice(0, 4)} columns={4} />
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/search/new-arrivals">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Dynamic Banners / Carousels / Product Carousels — spec yoksa eski yöntem */}
      {bannerData && bannerData.length > 0 && (
        <BannerSectionRenderer data={bannerData} />
      )}
      {carouselData && carouselData.length > 0 && (
        <CarouselSectionRenderer data={carouselData} />
      )}
      {productCarouselData && productCarouselData.length > 0 && (
        <DynamicProductCarousels items={productCarouselData} />
      )}

      {/* Feature Banner */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop"
              alt="Featured collection"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="lg:pl-12">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              The Edit
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
              Effortless sophistication for every moment
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Our latest collection celebrates the art of understated elegance. 
              Each piece is thoughtfully designed to transition seamlessly from day to evening, 
              combining luxurious fabrics with impeccable tailoring.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-secondary text-foreground">
                  <span className="text-sm font-bold">01</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Premium Materials</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sourced from the finest mills around the world
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-secondary text-foreground">
                  <span className="text-sm font-bold">02</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sustainable Fashion</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Committed to ethical and eco-conscious practices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-secondary text-foreground">
                  <span className="text-sm font-bold">03</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Timeless Design</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pieces that transcend seasonal trends
                  </p>
                </div>
              </div>
            </div>
            <Button asChild className="mt-8 h-12 px-8">
              <Link href="/search">Discover More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {show('bestsellers') && (
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Most Loved
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Bestsellers
            </h2>
          </div>
          <Link
            href="/search/bestsellers"
            className="hidden items-center gap-1 text-sm font-medium text-foreground hover:underline sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={bestsellers.slice(0, 4)} columns={4} />
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/search/bestsellers">View All Bestsellers</Link>
          </Button>
        </div>
      </section>
      )}

      {/* Instagram / Social Banner */}
      {show('social') && (
      <section className="bg-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-background md:text-3xl">
            Follow @owuan
          </h2>
          <p className="mt-2 text-background/70">
            Join our community and share your style with #OwnYourOwuan
          </p>
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
            {[
              '1515372039744-b8f02a3ae446',
              '1469334031218-e382a71b716b',
              '1490481651871-ab68de25d43d',
              '1594633312681-425c7b97ccd1',
              '1591047139829-d91aecb6caea',
              '1548036328-c9fa89d128fa',
            ].map((id, index) => (
              <a
                key={index}
                href="#"
                className="group relative aspect-square overflow-hidden"
              >
                <Image
                  src={`https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop`}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/20" />
              </a>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Trust Badges */}
      {show('trustBadges') && (
      <section className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Free Shipping</h3>
              <p className="mt-1 text-sm text-muted-foreground">On orders over $150</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Easy Returns</h3>
              <p className="mt-1 text-sm text-muted-foreground">30-day return policy</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Secure Payment</h3>
              <p className="mt-1 text-sm text-muted-foreground">SSL encrypted checkout</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">24/7 Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">We are here to help</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Newsletter */}
      {show('newsletter') && (
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              Join the Owuan World
            </h2>
            <p className="mt-3 text-muted-foreground">
              Subscribe to receive updates on new arrivals, exclusive offers, and styling inspiration.
            </p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
      )}
    </main>
  );
}
