// Cart Store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, Product, WishlistItem } from './types';
import { createEmptyCart, addToCart, removeFromCart, updateCartItemQuantity } from './index';

interface CartStore {
  cart: Cart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (product, variantId, quantity = 1) => {
        const newCart = addToCart(get().cart, product, variantId, quantity);
        set({ cart: newCart, isOpen: true });
      },
      removeItem: (lineId) => {
        const newCart = removeFromCart(get().cart, lineId);
        set({ cart: newCart });
      },
      updateQuantity: (lineId, quantity) => {
        const newCart = updateCartItemQuantity(get().cart, lineId, quantity);
        set({ cart: newCart });
      },
      clearCart: () => set({ cart: createEmptyCart() }),
    }),
    {
      name: 'owuan-cart',
    }
  )
);

// Wishlist Store
interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      addItem: (productId) => {
        const exists = get().items.some(item => item.productId === productId);
        if (!exists) {
          const newItem: WishlistItem = {
            id: `wishlist-${Date.now()}`,
            productId,
            userId: 'guest',
            addedAt: new Date().toISOString(),
          };
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.productId !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'owuan-wishlist',
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
        const current = get().productIds.filter(id => id !== productId);
        set({ productIds: [productId, ...current].slice(0, 10) });
      },
      clearAll: () => set({ productIds: [] }),
    }),
    {
      name: 'owuan-recently-viewed',
    }
  )
);
