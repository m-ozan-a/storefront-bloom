import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/actions';
import type { CrossSellItem, SlimProduct } from '@/actions';

export function SlimProductCard({
  product,
  offerType,
  discountPercent,
}: {
  product: SlimProduct;
  offerType?: 'normal' | 'discount';
  discountPercent?: number | null;
}) {
  const hasDiscount = offerType === 'discount' && !!product.discountedPrice;

  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 opacity-30" />
          </div>
        )}
        {hasDiscount && discountPercent != null && (
          <span className="absolute left-2 top-2 rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white">
            %{discountPercent}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-rose-600">
                {formatPrice(product.discountedPrice!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.salePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 border-t border-border pt-16">
      <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{children}</div>
    </section>
  );
}

export function CrossSellGrid({ items, title }: { items: CrossSellItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <Section title={title || 'Birlikte Daha İyi'}>
      {items.map((item) => (
        <SlimProductCard
          key={item.uid}
          product={item.product}
          offerType={item.offerType}
          discountPercent={item.discountPercent}
        />
      ))}
    </Section>
  );
}

export function RecommendationGrid({ products }: { products: SlimProduct[] }) {
  if (products.length === 0) return null;
  return (
    <Section title="Bunları da Beğenebilirsiniz">
      {products.map((p) => (
        <SlimProductCard key={p.id} product={p} />
      ))}
    </Section>
  );
}
