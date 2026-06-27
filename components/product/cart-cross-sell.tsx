'use client';

import { useEffect, useState } from 'react';
import { getCrossSell, filterByCampaign, type CrossSellItem } from '@/actions';
import { SlimProductCard } from './cross-sell-section';

export function CartCrossSell({
  productUids,
  hasCampaign,
}: {
  productUids: string[];
  hasCampaign: boolean;
}) {
  const [items, setItems] = useState<CrossSellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const key = productUids.join(',');

  useEffect(() => {
    let active = true;
    if (productUids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getCrossSell(productUids, 'cart').then((results) => {
      if (!active) return;
      const merged = filterByCampaign(results, hasCampaign);
      const unique = Array.from(
        new Map(merged.map((i) => [i.product.id, i])).values()
      );
      setItems(unique);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasCampaign]);

  if (loading) {
    return <div className="mt-12 min-h-[200px] animate-pulse rounded-lg bg-secondary" />;
  }
  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">
        Sepetinize Eklemeyi Unutmayın
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <SlimProductCard
            key={item.uid}
            product={item.product}
            offerType={item.offerType}
            discountPercent={item.discountPercent}
          />
        ))}
      </div>
    </section>
  );
}
