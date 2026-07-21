// ────────────────────────────────────────────────────────────────────────────
// Storefront Actions — UI ile owuan API arasındaki TEK katman.
//
// Akış: UI (page/component/layout)  →  actions  →  owuan API
//
// Kural: page/component/layout DOĞRUDAN istek atmaz, lib/owuan'a erişmez.
// Veri/işlem her zaman buradan çağrılır. Bu klasör + lib/owuan + app/api LOCKED'tır;
// owuan-Storefront tasarım agent'ı yalnızca shadcn UI düzenler, bu katmana dokunamaz.
// ────────────────────────────────────────────────────────────────────────────

// ---- Katalog / ürün / sayfa / menü / auth / newsletter (dummy fallback'li) ----
export {
  sorting,
  getProducts,
  getProductCount,
  getProduct,
  getProductById,
  getProductRecommendations,
  getCollections,
  getCollection,
  getCollectionProducts,
  getMenu,
  getNavTree,
  getPage,
  getPages,
  getManifest,
  subscribeToNewsletter,
  signIn,
  signUp,
  getMe,
  // Saf yardımcılar (istek değil — render/hesap)
  formatPrice,
  createEmptyCart,
  calculateCartTotals,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from "@/lib/owuan";

export type {
  Product,
  Collection,
  Menu,
  Page,
  Cart,
  CartItem,
  SortFilterItem,
  Manifest,
} from "@/lib/owuan";

// ---- R2 manifest (yavaş veri: store/theme/nav/footer) ----
export {
  getStorefrontManifest,
  getHeaderData,
  getFooterData,
} from "@/lib/owuan/manifest";

export type {
  StorefrontManifest,
  ProductUrls,
  HeaderData,
  FooterData,
  FooterColumn,
  NavLink,
} from "@/lib/owuan/manifest";

// ---- Statik ürün listeleri (R2 → api.owuan.com CDN) ----
export { getStaticProducts, getStaticProductRows } from "@/lib/owuan/static-products";
export type { StorefrontProductRow, StaticProductFilter } from "@/lib/owuan/static-products";

// ---- Katalog motoru (statik liste üstünde arama/filtre/facet) ----
export { searchCatalog } from "@/lib/owuan/catalog";
export type { CatalogQuery, CatalogResult, CatalogFacets, OptionGroup } from "@/lib/owuan/catalog";

// ---- Entity listeleri (statik R2: categories/collections/brands/labels/campaigns) ----
export {
  getCategoriesList,
  getCollectionsList,
  getBrandsList,
  getLabelsList,
  getCampaignsList,
} from "@/lib/owuan/entities";
export type {
  EntityCategory,
  EntityCollection,
  EntityBrand,
  EntityLabel,
  EntityCampaign,
} from "@/lib/owuan/entities";

// ---- Sepet / checkout / sipariş / adres / profil / favori / ödeme ----
export {
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  guestCheckout,
  memberCheckout,
  initPayment,
  getPaymentStatus,
  getCarrierRates,
  getOrders,
  getOrder,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/owuan/client";

// ---- Yorumlar / iade / iptal / hediye kartı / şifre / hesap / iletişim ----
export {
  getReviews,
  submitReview,
  applyCoupon,
  applyGiftCard,
  getReturns,
  getReturnDetail,
  initiateReturn,
  cancelOrder,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  submitContact,
} from "@/lib/owuan/client";

export type {
  ReviewItem,
  ReviewsData,
  CouponApplyResult,
  GiftCardApplyResult,
  ReturnListItem,
  ReturnDetailData,
  ReturnDetailItemInfo,
  ContactInput,
} from "@/lib/owuan/client";

// ---- Cross-sell / recommendations (owuan /storefront/cross-sell) ----
export { getCrossSell, filterByCampaign } from "@/lib/cross-sell";
export type { CrossSellItem, SlimProduct } from "@/lib/cross-sell";

export type {
  ServerCart,
  ServerCartItem,
  GuestCheckoutData,
  CheckoutResult,
  InitPaymentData,
  InitPaymentResult,
  OrderListItem,
  OrderDetail,
  OrderDetailItem,
  AddressItem,
  CreateAddressInput,
  UpdateAddressInput,
  ProfileData,
  UpdateProfileInput,
  FavoriteItem,
} from "@/lib/owuan/client";
