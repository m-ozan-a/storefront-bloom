// Owuan Commerce Provider Types

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo: SEO;
  tags: string[];
  updatedAt: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  discount?: number;
  campaignBadges?: CampaignBadge[];
  labels?: { title: string; slug: string }[];
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SEO {
  title: string;
  description: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount?: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: Product;
  };
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  image?: Image;
  updatedAt: string;
  path: string;
}

export interface Menu {
  title: string;
  path: string;
}

export interface ManifestCategory {
  uid: string;
  title: string;
  slug: string;
  subTitle: string | null;
  description: string | null;
  image?: string | null;
  parentId?: number;
  isActive: boolean;
}

export interface ManifestCollection {
  uid: string;
  title: string;
  slug: string;
  subTitle: string | null;
  description: string | null;
  image?: string | null;
  isActive: boolean;
}

export interface ManifestBrand {
  uid: string;
  title: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
}

export interface ManifestDeliveryOption {
  uid: string;
  title: string;
  deliveryFirm: string | null;
  deliveryFirmLogo: string | null;
  description: string | null;
}

export interface ManifestPaymentOption {
  uid: string;
  title: string;
  description: string | null;
}

export interface ManifestPaymentGateway {
  uid: string;
  provider: string;
  name: string;
  isActive: boolean;
  isTestMode: boolean;
}

export interface ManifestCarrierGateway {
  uid: string;
  provider: string;
  name: string;
  isActive: boolean;
  isTestMode: boolean;
}

export interface ManifestStore {
  name: string;
  domain: string;
  description: string | null;
  logoUrl: string | null;
  favicon: string | null;
  ogImage: string | null;
  address: string;
  phone: string;
  email: string;
  gtagId: string | null;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  tiktokPixelId: string | null;
  storeType: string;
  template: string;
}

export interface ManifestCampaign {
  uid: string;
  title: string;
  campaignType: "discount_percent" | "discount_amount" | "buy_x_get_y" | "free_shipping";
  discountPercent: number | null;
  discountAmount: number | null;
  minimumOrderAmount: number | null;
  startsAt: number;
  endsAt: number;
}

export interface CampaignBadge {
  campaignUid: string;
  type: string;
  label: string;
}

export interface AppliedCampaign {
  uid: string;
  title: string;
  campaignType: string;
  discountApplied: number;
  description: string;
}

export interface Manifest {
  store: ManifestStore;
  categories: ManifestCategory[];
  collections: ManifestCollection[];
  brands: ManifestBrand[];
  deliveryOptions: ManifestDeliveryOption[];
  paymentOptions: ManifestPaymentOption[];
  paymentGateways: ManifestPaymentGateway[];
  carrierGateways: ManifestCarrierGateway[];
  guestCheckoutEnabled: boolean;
  activeCampaigns: ManifestCampaign[];
}

export interface Page {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  totalAmount: Money;
  items: CartItem[];
  shippingAddress: Address;
}

export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};
