"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface FilterParams {
  category: string[];
  brand: string[];
  minPrice: number | null;
  maxPrice: number | null;
  size: string[];
  color: string[];
}

export const FILTER_PARAM_KEYS = ["category", "brand", "minPrice", "maxPrice", "size", "color"] as const;

export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  return {
    category: searchParams.get("category")?.split(",").filter(Boolean) ?? [],
    brand: searchParams.get("brand")?.split(",").filter(Boolean) ?? [],
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    size: searchParams.get("size")?.split(",").filter(Boolean) ?? [],
    color: searchParams.get("color")?.split(",").filter(Boolean) ?? [],
  };
}

export function useFilterParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseFilterParams(searchParams), [searchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category.length > 0) count++;
    if (filters.brand.length > 0) count++;
    if (filters.minPrice !== null || filters.maxPrice !== null) count++;
    if (filters.size.length > 0) count++;
    if (filters.color.length > 0) count++;
    return count;
  }, [filters]);

  const setFilter = useCallback(
    (key: keyof FilterParams, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const toggleArrayFilter = useCallback(
    (key: "category" | "brand" | "size" | "color", val: string) => {
      const current = filters[key];
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      setFilter(key, next.length > 0 ? next : null);
    },
    [filters, setFilter]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_PARAM_KEYS) {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return {
    filters,
    activeFilterCount,
    setFilter,
    toggleArrayFilter,
    clearAllFilters,
  };
}
