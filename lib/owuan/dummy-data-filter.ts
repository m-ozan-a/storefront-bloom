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
