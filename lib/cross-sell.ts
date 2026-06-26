// Cross-sell API client — owuan /storefront/cross-sell (server: direct + API key, client: proxy)

export interface SlimProduct {
  id: string;
  title: string;
  slug: string;
  salePrice: string;
  discountedPrice?: string | null;
  featuredImage: { url: string; altText: string; width: number; height: number } | null;
}

export interface CrossSellItem {
  uid: string;
  name: string;
  description?: string;
  offerType: 'normal' | 'discount';
  discountPercent: number | null;
  displayLocation: 'product_detail' | 'cart';
  campaignUsage: 'with_campaign' | 'without_campaign' | 'both';
  product: SlimProduct;
}

function apiBase(): string {
  if (process.env.NEXT_PUBLIC_OWUAN_API_URL) return process.env.NEXT_PUBLIC_OWUAN_API_URL;
  if (process.env.NODE_ENV === 'production') return 'https://app.owuan.com';
  return 'http://localhost:3000';
}

export async function getCrossSell(
  productUids: string | string[],
  location?: 'product_detail' | 'cart'
): Promise<CrossSellItem[]> {
  const uids = Array.isArray(productUids) ? productUids : [productUids];
  if (uids.length === 0) return [];
  const isServer = typeof window === 'undefined';
  const qs = new URLSearchParams({ productUids: uids.join(',') });
  if (location) qs.set('location', location);
  const path = `/storefront/cross-sell?${qs.toString()}`;
  const url = isServer ? `${apiBase()}/api${path}` : `/api/proxy${path}`;
  const headers: Record<string, string> = isServer
    ? { 'X-Store-API-Key': process.env.OWUAN_STORE_API_KEY || '' }
    : {};
  try {
    const res = await fetch(url, {
      headers,
      ...(isServer ? { next: { revalidate: 300, tags: ['cross-sell'] } } : {}),
    });
    const json = (await res.json()) as { success: boolean; data?: CrossSellItem[] };
    return json.success && json.data ? json.data : [];
  } catch {
    return [];
  }
}

// campaignUsage filtresi: aktif kampanya durumuna göre kuralı göster
export function filterByCampaign(items: CrossSellItem[], hasCampaign: boolean): CrossSellItem[] {
  return items.filter((i) =>
    i.campaignUsage === 'both' ||
    (i.campaignUsage === 'with_campaign' ? hasCampaign : !hasCampaign)
  );
}
