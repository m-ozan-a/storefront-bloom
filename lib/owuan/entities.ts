// Entity listeleri — R2 snapshot, api.owuan.com CDN (public, header YOK, düz array).
// categories.json / collections.json / brands.json / labels.json / campaigns.json

import { storefrontDataUrl } from "./manifest";

export interface EntityCategory {
  uid: string;
  title: string;
  slug: string;
  subTitle?: string | null;
  description?: string | null;
  image?: string | null;
  parentId?: number | null;
  isActive: boolean;
}

export interface EntityCollection {
  uid: string;
  title: string;
  slug: string;
  subTitle?: string | null;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
}

export interface EntityBrand {
  uid: string;
  title: string;
  slug: string;
  description?: string | null;
  logo?: string;
  isActive: boolean;
}

export interface EntityLabel {
  uid: string;
  title: string;
  slug: string;
  subTitle?: string | null;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
}

export interface EntityCampaign {
  uid: string;
  title: string;
  slug: string;
  description?: string | null;
  campaignType: "discount_percent" | "discount_amount" | "buy_x_get_y" | "free_shipping" | "coupon";
  discountPercent?: number | null;
  discountAmount?: number | null;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount?: number | null;
  startsAt: number;
  endsAt: number;
  badgeImage?: string | null;
  bannerImage?: string | null;
  isActive: boolean;
}

async function fetchEntityList<T>(file: string, revalidate = 3600): Promise<T[]> {
  try {
    const res = await fetch(storefrontDataUrl(file), { next: { revalidate } });
    if (!res.ok) return [];
    const json = (await res.json()) as T[];
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export const getCategoriesList = () => fetchEntityList<EntityCategory>("categories.json");
export const getCollectionsList = () => fetchEntityList<EntityCollection>("collections.json");
export const getBrandsList = () => fetchEntityList<EntityBrand>("brands.json");
export const getLabelsList = () => fetchEntityList<EntityLabel>("labels.json");
export const getCampaignsList = () => fetchEntityList<EntityCampaign>("campaigns.json");
