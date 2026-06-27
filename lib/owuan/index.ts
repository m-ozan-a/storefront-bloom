// Owuan Commerce Provider - API Functions
// Connected to api.owuan.com for real tenant DB data
// Falls back to dummy data when API is unavailable

import {
  products as dummyProducts,
  collections as dummyCollections,
  headerMenu as dummyHeaderMenu,
  footerMenu as dummyFooterMenu,
  pages as dummyPages,
} from "./dummy-data";
import {
  getProducts as apiGetProducts,
  getProductCount as apiGetProductCount,
  getProduct as apiGetProduct,
  getProductById as apiGetProductById,
  getProductRecommendations as apiGetProductRecommendations,
  getCollections as apiGetCollections,
  getCollection as apiGetCollection,
  getCollectionProducts as apiGetCollectionProducts,
  getManifest,
  getMenu as apiGetMenu,
  getNavTree as apiGetNavTree,
  getPage as apiGetPage,
  getPages as apiGetPages,
  subscribeToNewsletter as apiSubscribeToNewsletter,
  signIn as apiSignIn,
  signUp as apiSignUp,
  getMe as apiGetMe,
} from "./client";
import type {
  Product,
  Collection,
  Menu,
  Page,
  Cart,
  CartItem,
  SortFilterItem,
  Manifest,
} from "./types";

// ---- Exports ----

export type { Product, Collection, Menu, Page, Cart, CartItem, SortFilterItem, Manifest };

// Sorting options
export const sorting: SortFilterItem[] = [
  { title: "Önerilen", slug: null, sortKey: "RELEVANCE", reverse: false },
  { title: "Öne Çıkanlar", slug: "trending", sortKey: "BEST_SELLING", reverse: false },
  { title: "En Yeniler", slug: "latest", sortKey: "CREATED_AT", reverse: true },
  { title: "Fiyat: Düşükten Yükseğe", slug: "price-asc", sortKey: "PRICE", reverse: false },
  { title: "Fiyat: Yüksekten Düşüğe", slug: "price-desc", sortKey: "PRICE", reverse: true },
];

// ---- Product APIs ----

export async function getProducts(options?: {
  collection?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  label?: string[];
  revalidate?: number;
}): Promise<Product[]> {
  try {
    const products = await apiGetProducts(options);
    if (products.length > 0) return products;
  } catch (e) {
    console.warn("API getProducts failed, using dummy data:", e);
  }

  // Fallback to dummy data with same filters
  const { filterProducts } = await import("./dummy-data-filter");
  let filtered = filterProducts(dummyProducts, options);
  if (options?.offset) filtered = filtered.slice(options.offset);
  if (options?.limit) filtered = filtered.slice(0, options.limit);
  return filtered;
}

export async function getProductCount(options?: {
  collection?: string;
  query?: string;
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  label?: string[];
}): Promise<number> {
  try {
    const count = await apiGetProductCount(options);
    if (count > 0) return count;
  } catch (e) {
    console.warn("API getProductCount failed, using dummy data:", e);
  }
  const { filterProducts } = await import("./dummy-data-filter");
  return filterProducts(dummyProducts, options).length;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    const product = await apiGetProduct(handle);
    if (product) return product;
  } catch (e) {
    console.warn(`API getProduct(${handle}) failed, using dummy data:`, e);
  }
  return dummyProducts.find((p) => p.handle === handle);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const product = await apiGetProductById(id);
    if (product) return product;
  } catch (e) {
    console.warn(`API getProductById(${id}) failed, using dummy data:`, e);
  }
  return dummyProducts.find((p) => p.id === id);
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  try {
    const recs = await apiGetProductRecommendations(productId);
    if (recs.length > 0) return recs;
  } catch (e) {
    console.warn(`API getProductRecommendations failed, using dummy data:`, e);
  }

  const product = dummyProducts.find((p) => p.id === productId);
  if (!product) return [];
  return dummyProducts
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, 4);
}

// ---- Collection APIs ----

export async function getCollections(): Promise<Collection[]> {
  try {
    const cols = await apiGetCollections();
    if (cols.length > 0) return cols;
  } catch (e) {
    console.warn("API getCollections failed, using dummy data:", e);
  }
  return dummyCollections;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  try {
    const col = await apiGetCollection(handle);
    if (col) return col;
  } catch (e) {
    console.warn(`API getCollection(${handle}) failed, using dummy data:`, e);
  }
  return dummyCollections.find((c) => c.handle === handle);
}

export async function getCollectionProducts(
  collection: string,
  options?: { sortKey?: string; reverse?: boolean }
): Promise<Product[]> {
  return getProducts({ collection, ...options });
}

// ---- Menu APIs ----

export async function getMenu(handle: "header" | "footer"): Promise<Menu[]> {
  try {
    const menu = await apiGetMenu(handle);
    if (menu.length > 0) return menu;
  } catch (e) {
    console.warn(`API getMenu(${handle}) failed, using dummy data:`, e);
  }
  return handle === "header" ? dummyHeaderMenu : dummyFooterMenu;
}

// ---- Page APIs ----

export async function getPage(slug: string): Promise<Page | undefined> {
  try {
    const page = await apiGetPage(slug);
    if (page) return page;
  } catch (e) {
    console.warn(`API getPage(${slug}) failed, using dummy data:`, e);
  }
  return dummyPages.find((p) => p.slug === slug);
}

export async function getPages(): Promise<Page[]> {
  try {
    const pages = await apiGetPages();
    if (pages.length > 0) return pages;
  } catch (e) {
    console.warn("API getPages failed, using dummy data:", e);
  }
  return dummyPages;
}

// ---- Newsletter ----

export { apiSubscribeToNewsletter as subscribeToNewsletter };

export async function getNavTree(handle: "header" | "footer") {
  try {
    const tree = await apiGetNavTree(handle);
    if (tree.length > 0) return tree;
  } catch (e) {
    console.warn(`API getNavTree(${handle}) failed:`, e);
  }
  return [];
}

// ---- Auth (re-export from client) ----

export { apiSignIn as signIn, apiSignUp as signUp, apiGetMe as getMe };

// ---- Manifest ----

export { getManifest };

// ---- Cart helper functions (in-memory, same as before) ----

export function createEmptyCart(): Cart {
  return {
    id: `cart-${Date.now()}`,
    checkoutUrl: "/checkout",
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "TRY" },
      totalAmount: { amount: "0.00", currencyCode: "TRY" },
      totalTaxAmount: { amount: "0.00", currencyCode: "TRY" },
    },
    lines: [],
    totalQuantity: 0,
  };
}

export function calculateCartTotals(lines: CartItem[]): Cart["cost"] {
  const subtotal = lines.reduce((sum, item) => {
    return sum + parseFloat(item.cost.totalAmount.amount);
  }, 0);
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + tax;
  return {
    subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: "TRY" },
    totalAmount: { amount: total.toFixed(2), currencyCode: "TRY" },
    totalTaxAmount: { amount: tax.toFixed(2), currencyCode: "TRY" },
  };
}

export function addToCart(
  cart: Cart,
  product: Product,
  variantId: string,
  quantity = 1
): Cart {
  // Varyantsız ürünlerde gerçek varyant yok → ürünün kendisini synthetic varyant olarak kullan.
  const variant =
    product.variants.find((v) => v.id === variantId) ??
    (product.variants.length === 0
      ? {
          id: product.id,
          title: product.title,
          availableForSale: product.availableForSale,
          selectedOptions: [],
          price: product.priceRange.minVariantPrice,
        }
      : undefined);
  if (!variant) return cart;

  const existingLineIndex = cart.lines.findIndex(
    (line) => line.merchandise.id === variant.id
  );

  let newLines: CartItem[];

  if (existingLineIndex >= 0) {
    newLines = cart.lines.map((line, index) => {
      if (index === existingLineIndex) {
        const newQuantity = line.quantity + quantity;
        return {
          ...line,
          quantity: newQuantity,
          cost: {
            totalAmount: {
              amount: (parseFloat(variant.price.amount) * newQuantity).toFixed(2),
              currencyCode: variant.price.currencyCode,
            },
          },
        };
      }
      return line;
    });
  } else {
    const newLine: CartItem = {
      id: `line-${Date.now()}`,
      quantity,
      cost: {
        totalAmount: {
          amount: (parseFloat(variant.price.amount) * quantity).toFixed(2),
          currencyCode: variant.price.currencyCode,
        },
      },
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        product,
      },
    };
    newLines = [...cart.lines, newLine];
  }

  return {
    ...cart,
    lines: newLines,
    cost: calculateCartTotals(newLines),
    totalQuantity: newLines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export function removeFromCart(cart: Cart, lineId: string): Cart {
  const newLines = cart.lines.filter((line) => line.id !== lineId);
  return {
    ...cart,
    lines: newLines,
    cost: calculateCartTotals(newLines),
    totalQuantity: newLines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export function updateCartItemQuantity(
  cart: Cart,
  lineId: string,
  quantity: number
): Cart {
  if (quantity <= 0) return removeFromCart(cart, lineId);
  const newLines = cart.lines.map((line) => {
    if (line.id === lineId) {
      const pricePerItem =
        parseFloat(line.cost.totalAmount.amount) / line.quantity;
      return {
        ...line,
        quantity,
        cost: {
          totalAmount: {
            amount: (pricePerItem * quantity).toFixed(2),
            currencyCode: line.cost.totalAmount.currencyCode,
          },
        },
      };
    }
    return line;
  });
  return {
    ...cart,
    lines: newLines,
    cost: calculateCartTotals(newLines),
    totalQuantity: newLines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

// Price formatting
export function formatPrice(amount: string, currencyCode = "TRY"): string {
  const currency = currencyCode === "TRY" ? "₺" : currencyCode === "USD" ? "$" : "€";
  const num = parseFloat(amount);
  if (currency === "₺") {
    return `${num.toFixed(2).replace(".", ",")} ${currency}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(num);
}
