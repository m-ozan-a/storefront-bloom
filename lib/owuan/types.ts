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
  isNew: boolean;
  isBestseller: boolean;
  discount?: number;
  campaignBadges?: CampaignBadge[];
  labels?: { title: string; slug: string }[];
  collections?: { title: string; slug: string }[];
  rating?: number | null;
  reviewCount?: number;
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
  blurData?: string | null;
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
  discountTotal?: number;
  shippingTotal?: number;
  appliedCampaigns?: { uid: string; title: string; discountApplied: number; description: string }[];
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
  logo: string | null;
  method: "redirect" | "iframe" | "internal";
  isPrimary: boolean;
  sortOrder: number;
  installments: number[] | null;
  callbackMethod: "redis" | "direct";
  isActive: boolean;
  isTestMode: boolean;
}

export interface ManifestCarrierGateway {
  uid: string;
  provider: string;
  name: string;
  logo: string | null;
  isPrimary: boolean;
  pricingType: "fixed" | "calculated";
  basePrice: number | null;
  campaignDiscount: number | null;
  campaignLabel: string | null;
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
  geoLocation: string | null;
  phone: string;
  email: string;
  gtagId: string | null;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  tiktokPixelId: string | null;
  otherPixelId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  storeType: string;
  template: string;
  taxtNumber: string | null;
  taxtOffice: string | null;
  mersisNumber: string | null;
  kepNumber: string | null;
  defaultPaymentGateway: string | null;
  defaultCarrierGateway: string | null;
  allowGuestCheckout: boolean;
  ga4PropertyId: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTiktok: string | null;
  socialYoutube: string | null;
  socialLinkedin: string | null;
  bankTransferEnabled: boolean;
  ibanDetails: { bankName?: string; iban?: string; accountHolder?: string } | null;
  shopShippingEnabled: boolean;
  shopShippingName: string | null;
  shopShippingPrice: number | null;
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
  badgeImage?: string;
}

export interface AppliedCampaign {
  uid: string;
  title: string;
  campaignType: string;
  discountApplied: number;
  description: string;
}

export interface ManifestTheme {
  uid: string;
  name: string;
  version: string;
  colors: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
  } | null;
  fontFamilies: {
    heading?: string;
    sans?: string;
    mono?: string;
  } | null;
  borderRadius: string | null;
  darkModeSupport: boolean;
  headerStyle: string | null;
  footerStyle: string | null;
  productCardStyle: string | null;
  productGridColumns: number | null;
  components: Record<string, boolean>;
  sections: SectionsData | null;
  customCss: string | null;
  customHeadHtml: string | null;
  darkColors: Record<string, string> | null;
  productPageStyle: string | null;
  listingPageStyle: string | null;
  spec: unknown | null;
  // Faz G — ek içerik bölgesi spec'leri (homepage dışı yüzeyler). Yoksa null = varsayılan görünüm.
  headerSpec: unknown | null;
  footerSpec: unknown | null;
  productPageSpec: unknown | null;
  listingSpec: unknown | null;
}

export interface NavItem {
  title: string;
  type: "category" | "collection" | "brand" | "custom" | "page";
  slug?: string;
  path?: string;
  image?: string;
  children?: NavItem[];
}

export interface SectionsData {
  navigation?: {
    header?: NavItem[];
    footer?: NavItem[];
  };
  announcement?: {
    text?: string;
    enabled?: boolean;
  };
  homepage?: {
    hero?: {
      heading: string;
      subheading?: string;
      ctaText?: string;
      ctaUrl?: string;
      imageUrl?: string;
      videoUrl?: string;
      variant?: string;
    };
    banners?: {
      title: string;
      description?: string;
      imageUrl: string;
      linkUrl: string;
      position?: number;
      variant?: string;
    }[];
    carousels?: {
      title?: string;
      images: { url: string; alt?: string; linkUrl?: string }[];
      variant?: string;
    }[];
    productCarousels?: {
      title: string;
      collection?: string;
      tag?: string;
      maxItems?: number;
    }[];
  };
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
  activeTheme: ManifestTheme | null;
}

export interface Page {
  uid: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
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

export interface WishlistProduct {
  id: string;
  handle: string;
  title: string;
  brand?: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage: { url: string; altText: string; width: number; height: number } | null;
  variants: { id: string; availableForSale: boolean }[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: string;
  product?: WishlistProduct;
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
