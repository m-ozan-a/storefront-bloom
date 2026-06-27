import { Fragment } from 'react';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { PromoBannersDuo, PromoBannerWide } from '@/components/sections/promo-banners';
import { CategoryGridSection, type CategoryGridItem } from '@/components/sections/category-grid';
import { TrustBadgesSection, type TrustBadgeItem } from '@/components/sections/trust-badges';
import { NewsletterSignupSection } from '@/components/sections/newsletter-signup';
import { ProductCarouselSection } from '@/components/product/product-carousel-section';
import { WrapperSkeleton } from '@/components/wrapper-skeleton';
import type { Product } from '@/lib/owuan/types';

const DEFAULT_TRUST_BADGES: TrustBadgeItem[] = [
  { icon: 'Truck', title: 'Hızlı Teslimat', description: '2-4 iş günü içinde kapınızda.' },
  { icon: 'RotateCcw', title: 'Kolay İade', description: '30 gün içinde koşulsuz iade.' },
  { icon: 'Shield', title: 'Güvenli Ödeme', description: '256-bit SSL ile güvenli alışveriş.' },
  { icon: 'Headphones', title: '7/24 Destek', description: 'Canlı destek hattımız her zaman yanınızda.' },
];

export interface PageShellData {
  storeName: string;
  storeDescription?: string | null;
  categories: CategoryGridItem[];
  products: Product[];
}

function renderWrapper(name: string, data: PageShellData, cardStyle: "classic" | "modern" | "minimal") {
  switch (name) {
    case 'hero':
      return (
        <>
          <HeroCarousel />
          {data.products.length > 0 ? (
            <ProductCarouselSection
              carousels={[{ title: 'Popüler Ürünler', products: data.products }]}
              cardStyle={cardStyle}
            />
          ) : (
            <WrapperSkeleton kind="product-showcase" />
          )}
          <PromoBannersDuo />
        </>
      );

    case 'category-banners':
      return data.categories.length > 0 ? (
        <>
          <CategoryGridSection data={{ title: 'Kategoriler', columns: '3', categories: data.categories }} />
          <PromoBannerWide />
        </>
      ) : (
        <WrapperSkeleton kind="category-banners" />
      );

    case 'product-showcase':
      return data.products.length > 0 ? (
        <ProductCarouselSection carousels={[{ title: 'Yeni Gelenler', products: data.products }]} cardStyle={cardStyle} />
      ) : (
        <WrapperSkeleton kind="product-showcase" />
      );

    case 'trust-badges':
      return <TrustBadgesSection data={{ items: DEFAULT_TRUST_BADGES }} />;

    case 'newsletter':
      return (
        <NewsletterSignupSection
          data={{
            title: 'Gelişmelerden haberdar olun',
            subtitle: 'En yeni ürünler, kampanyalar ve özel fırsatlar için kaydolun.',
          }}
        />
      );

    case 'footer':
      return null; // layout chrome

    default:
      return null;
  }
}

export function PageShell({ wrappers, data, cardStyle = "classic" }: { wrappers: string[]; data: PageShellData; cardStyle?: "classic" | "modern" | "minimal" }) {
  return (
    <main>
      {wrappers.map((name) => (
        <Fragment key={name}>{renderWrapper(name, data, cardStyle)}</Fragment>
      ))}
    </main>
  );
}
