// Dummy data fallback filter function
// Used when API is unavailable - mirrors the server-side filtering logic

import type { Product } from "./types";

export function filterProducts(
  allProducts: Product[],
  options?: {
    collection?: string;
    query?: string;
    sortKey?: string;
    reverse?: boolean;
    category?: string[];
    brand?: string[];
    minPrice?: number;
    maxPrice?: number;
    size?: string[];
    color?: string[];
  }
): Product[] {
  let filtered = [...allProducts];

  if (options?.collection) {
    const collectionHandle = options.collection.toLowerCase();
    if (collectionHandle === "new-arrivals") {
      filtered = filtered.filter((p) => p.isNew);
    } else if (collectionHandle === "bestsellers") {
      filtered = filtered.filter((p) => p.isBestseller);
    } else if (collectionHandle === "sale") {
      filtered = filtered.filter((p) => p.discount && p.discount > 0);
    } else {
      filtered = filtered.filter((p) => p.category === collectionHandle);
    }
  }

  if (options?.query) {
    const query = options.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (options?.category?.length) {
    filtered = filtered.filter((p) => options.category!.includes(p.category));
  }

  if (options?.brand?.length) {
    filtered = filtered.filter((p) => options.brand!.includes(p.brand));
  }

  if (options?.minPrice != null) {
    filtered = filtered.filter(
      (p) => parseFloat(p.priceRange.minVariantPrice.amount) >= options.minPrice!
    );
  }

  if (options?.maxPrice != null) {
    filtered = filtered.filter(
      (p) => parseFloat(p.priceRange.minVariantPrice.amount) <= options.maxPrice!
    );
  }

  if (options?.size?.length) {
    filtered = filtered.filter((p) => {
      const sizeOption = p.options.find((o) => o.name.toLowerCase() === "size");
      if (!sizeOption) return false;
      return sizeOption.values.some((v) => options.size!.includes(v));
    });
  }

  if (options?.color?.length) {
    filtered = filtered.filter((p) => {
      const colorOption = p.options.find((o) => o.name.toLowerCase() === "color");
      if (!colorOption) return false;
      return colorOption.values.some((v) => options.color!.includes(v));
    });
  }

  if (options?.sortKey) {
    switch (options.sortKey) {
      case "PRICE":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
          const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
          return options.reverse ? priceB - priceA : priceA - priceB;
        });
        break;
      case "CREATED_AT":
        filtered.sort((a, b) => {
          return options.reverse
            ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        });
        break;
      case "BEST_SELLING":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
  }

  return filtered;
}
