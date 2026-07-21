"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface FilterParams {
  category: string[];
  brand: string[];
  minPrice: number | null;
  maxPrice: number | null;
  options: Record<string, string[]>;
}

export const FILTER_PARAM_KEYS = ["category", "brand", "minPrice", "maxPrice", "opt"] as const;

import { parseOptionParam, serializeOptionParam } from "@/lib/filter-params";

export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  return {
    category: searchParams.get("category")?.split(",").filter(Boolean) ?? [],
    brand: searchParams.get("brand")?.split(",").filter(Boolean) ?? [],
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    options: parseOptionParam(searchParams.get("opt")),
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
    count += Object.values(filters.options).filter((v) => v.length > 0).length;
    return count;
  }, [filters]);

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setFilter = useCallback(
    (key: "category" | "brand" | "minPrice" | "maxPrice", value: string | string[] | null) => {
      pushParams((params) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      });
    },
    [pushParams]
  );

  const toggleArrayFilter = useCallback(
    (key: "category" | "brand", val: string) => {
      const current = filters[key];
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      setFilter(key, next.length > 0 ? next : null);
    },
    [filters, setFilter]
  );

  const toggleOptionFilter = useCallback(
    (name: string, value: string) => {
      const current = filters.options[name] ?? [];
      const nextVals = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const next = { ...filters.options, [name]: nextVals };
      const serialized = serializeOptionParam(next);
      pushParams((params) => {
        if (serialized) params.set("opt", serialized);
        else params.delete("opt");
      });
    },
    [filters, pushParams]
  );

  const clearAllFilters = useCallback(() => {
    pushParams((params) => {
      for (const key of FILTER_PARAM_KEYS) params.delete(key);
    });
  }, [pushParams]);

  return {
    filters,
    activeFilterCount,
    setFilter,
    toggleArrayFilter,
    toggleOptionFilter,
    clearAllFilters,
  };
}
