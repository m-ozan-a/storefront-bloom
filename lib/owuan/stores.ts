// Cart Store using Zustand — API-backed for authenticated users, localStorage for guests

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, Product, WishlistItem } from './types';
import {
  createEmptyCart as createEmptyCartLocal,
  addToCart as addToCartLocal,
  removeFromCart as removeFromCartLocal,
  updateCartItemQuantity as updateCartItemQuantityLocal,
} from './index';
import {
  getCart as getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  type ServerCart,
  addFavorite,
  removeFavorite,
  getFavorites,
} from './client';

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('owuan-auth-token');
}

function mapServerCartToLocal(serverCart: ServerCart): Cart {
  if (!serverCart.id) return createEmptyCartLocal();

  const subtotal = serverCart.total;
  const tax = serverCart.taxTotal;
  const total = subtotal + tax;

  return {
    id: serverCart.id,
    checkoutUrl: '/checkout',
    cost: {
      subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: 'TRY' },
      totalAmount: { amount: total.toFixed(2), currencyCode: 'TRY' },
      totalTaxAmount: { amount: tax.toFixed(2), currencyCode: 'TRY' },
    },
    lines: serverCart.items.map((item) => {
      const variantTitle =
        item.variant.selectedOptions.map((o) => o.value).join(' / ') ||
        item.product.title;

      const imageUrl =
        typeof item.product.featuredImage === 'string'
          ? item.product.featuredImage
          : item.product.featuredImage?.url ?? '';
      const imageAlt =
        typeof item.product.featuredImage === 'string'
          ? item.product.title
          : item.product.featuredImage?.altText ?? '';

      return {
        id: item.id,
        quantity: item.quantity,
        cost: {
          totalAmount: item.price,
        },
        merchandise: {
          id: item.variant.uid,
          title: variantTitle,
          selectedOptions: item.variant.selectedOptions,
          product: {
            id: item.product.uid,
            handle: item.product.handle,
            title: item.product.title,
            description: '',
            descriptionHtml: '',
            availableForSale: true,
            options: [],
            priceRange: {
              maxVariantPrice: item.price,
              minVariantPrice: item.price,
            },
            variants: [],
            featuredImage: imageUrl
              ? { url: imageUrl, altText: imageAlt, width: 800, height: 1000 }
              : { url: '', altText: '', width: 0, height: 0 },
            images: [],
            seo: { title: item.product.title, description: '' },
            tags: [],
            updatedAt: '',
            category: '',
            brand: '',
            isNew: false,
            isBestseller: false,
          },
        },
      };
    }),
    totalQuantity: serverCart.totalQuantity,
    discountTotal: serverCart.discountTotal,
    shippingTotal: serverCart.shippingTotal,
    appliedCampaigns: serverCart.appliedCampaigns,
  };
}

async function loadServerCart(): Promise<Cart | null> {
  const serverCart = await getCartApi();
  if (!serverCart) return null;
  return mapServerCartToLocal(serverCart);
}

interface CartStore {
  cart: Cart;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  clearError: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createEmptyCartLocal(),
      isOpen: false,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        if (!isAuthenticated()) return;
        set({ isLoading: true, error: null });
        try {
          const cart = await loadServerCart();
          if (cart) {
            set({ cart });
          }
        } catch {
          // keep local cart on fetch failure
        } finally {
          set({ isLoading: false });
        }
      },

      openCart: () => {
        set({ isOpen: true });
        if (isAuthenticated()) {
          get().fetchCart();
        }
      },

      closeCart: () => set({ isOpen: false }),

      clearError: () => set({ error: null }),

      addItem: async (product, variantId, quantity = 1) => {
        if (isAuthenticated()) {
          set({ isLoading: true, error: null });
          try {
            await addToCartApi(variantId || null, quantity, product.id);
            const cart = await loadServerCart();
            if (cart) {
              set({ cart, isOpen: true, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } catch (e) {
            set({
              error: e instanceof Error ? e.message : 'Sepete eklenemedi.',
              isLoading: false,
            });
          }
        } else {
          const newCart = addToCartLocal(get().cart, product, variantId, quantity);
          set({ cart: newCart, isOpen: true });
        }
      },

      removeItem: async (lineId) => {
        if (isAuthenticated()) {
          set({ isLoading: true, error: null });
          try {
            await removeCartItemApi(lineId);
            const cart = await loadServerCart();
            if (cart) {
              set({ cart, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } catch (e) {
            set({
              error: e instanceof Error ? e.message : 'Ürün sepetten kaldırılamadı.',
              isLoading: false,
            });
          }
        } else {
          const newCart = removeFromCartLocal(get().cart, lineId);
          set({ cart: newCart });
        }
      },

      updateQuantity: async (lineId, quantity) => {
        if (isAuthenticated()) {
          set({ isLoading: true, error: null });
          try {
            await updateCartItemApi(lineId, quantity);
            const cart = await loadServerCart();
            if (cart) {
              set({ cart, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } catch (e) {
            set({
              error: e instanceof Error ? e.message : 'Miktar güncellenemedi.',
              isLoading: false,
            });
          }
        } else {
          const newCart = updateCartItemQuantityLocal(get().cart, lineId, quantity);
          set({ cart: newCart });
        }
      },

      clearCart: () => set({ cart: createEmptyCartLocal() }),
    }),
    {
      name: 'owuan-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// Wishlist Store — API-backed for authenticated users, localStorage for guests
interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      fetchWishlist: async () => {
        if (!isAuthenticated()) return;
        set({ isLoading: true });
        try {
          const favs = await getFavorites();
          const mapped: WishlistItem[] = favs
            .filter((f) => f.product != null)
            .map((f) => ({
              id: `fav-${f.id}`,
              productId: f.product!.id,
              userId: 'member',
              addedAt: new Date(f.createdAt).toISOString(),
              product: f.product ? {
                id: f.product.id,
                handle: f.product.handle,
                title: f.product.title,
                priceRange: f.product.priceRange,
                featuredImage: f.product.featuredImage,
                variants: [],
              } : undefined,
            }));
          set({ items: mapped, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      openWishlist: () => {
        set({ isOpen: true });
        if (isAuthenticated()) {
          get().fetchWishlist();
        }
      },
      closeWishlist: () => set({ isOpen: false }),

      addItem: async (productId) => {
        const exists = get().items.some((item) => item.productId === productId);
        if (exists) return;

        if (isAuthenticated()) {
          try {
            await addFavorite(productId);
            await get().fetchWishlist();
          } catch {}
        } else {
          const newItem: WishlistItem = {
            id: `wishlist-${Date.now()}`,
            productId,
            userId: 'guest',
            addedAt: new Date().toISOString(),
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: async (productId) => {
        if (isAuthenticated()) {
          try {
            await removeFavorite(productId);
            set({
              items: get().items.filter((item) => item.productId !== productId),
            });
          } catch {}
        } else {
          set({
            items: get().items.filter((item) => item.productId !== productId),
          });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'owuan-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Recently Viewed Store
interface RecentlyViewedStore {
  productIds: string[];
  addProduct: (productId: string) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (productId) => {
        const current = get().productIds.filter((id) => id !== productId);
        set({ productIds: [productId, ...current].slice(0, 10) });
      },
      clearAll: () => set({ productIds: [] }),
    }),
    {
      name: 'owuan-recently-viewed',
    }
  )
);
