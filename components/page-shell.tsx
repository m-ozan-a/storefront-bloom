import { Fragment } from 'react';
import { HeroSection } from '@/components/sections/hero';
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

// Wrapper adı → sabit gerçek component. Spec YORUMLANMAZ (json-render storefront'ta yok).
// Veri manifest'ten gelir; veri yoksa skeleton ile yeri tutulur. footer/header layout chrome.
function renderWrapper(name: string, data: PageShellData) {
  switch (name) {
    case 'hero':
      return (
        <HeroSection
          data={{
            heading: data.storeName
              ? `${data.storeName} dünyasına hoş geldiniz`
              : 'Yeni Sezon Koleksiyonu',
            subheading: data.storeDescription || 'Özenle seçilmiş ürünler, uygun fiyatlar ve hızlı teslimat.',
            ctaText: 'Alışverişe Başla',
            ctaUrl: '/search',
          }}
        />
      );

    case 'category-banners':
      return data.categories.length > 0 ? (
        <CategoryGridSection data={{ title: 'Kategoriler', categories: data.categories }} />
      ) : (
        <WrapperSkeleton kind="category-banners" />
      );

    case 'product-showcase':
      return data.products.length > 0 ? (
        <ProductCarouselSection carousels={[{ title: 'Yeni Gelenler', products: data.products }]} />
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

export function PageShell({ wrappers, data }: { wrappers: string[]; data: PageShellData }) {
  return (
    <main>
      {wrappers.map((name) => (
        <Fragment key={name}>{renderWrapper(name, data)}</Fragment>
      ))}
    </main>
  );
}
