"use client";

import { X } from "lucide-react";
import { useFilterParams } from "@/hooks/use-filter-params";
import { Button } from "@/components/ui/button";

export function ActiveFilters() {
  const { filters, clearAllFilters, setFilter, toggleOptionFilter } = useFilterParams();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  for (const cat of filters.category) {
    chips.push({
      key: `cat-${cat}`,
      label: cat,
      onRemove: () =>
        setFilter(
          "category",
          filters.category.filter((c) => c !== cat).length > 0
            ? filters.category.filter((c) => c !== cat)
            : null
        ),
    });
  }

  for (const b of filters.brand) {
    chips.push({
      key: `brand-${b}`,
      label: b,
      onRemove: () =>
        setFilter(
          "brand",
          filters.brand.filter((x) => x !== b).length > 0
            ? filters.brand.filter((x) => x !== b)
            : null
        ),
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const label = [
      filters.minPrice !== null ? `₺${filters.minPrice}` : "",
      filters.maxPrice !== null ? `₺${filters.maxPrice}` : "",
    ]
      .filter(Boolean)
      .join(" – ");
    chips.push({
      key: "price",
      label,
      onRemove: () => {
        setFilter("minPrice", null);
        setFilter("maxPrice", null);
      },
    });
  }

  for (const [name, vals] of Object.entries(filters.options)) {
    for (const val of vals) {
      chips.push({
        key: `opt-${name}-${val}`,
        label: `${name}: ${val}`,
        onRemove: () => toggleOptionFilter(name, val),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 text-xs font-medium"
          key={chip.key}
        >
          {chip.label}
          <button
            className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full hover:bg-muted-foreground/20"
            onClick={chip.onRemove}
            type="button"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button className="h-7 px-2 text-xs" onClick={clearAllFilters} size="sm" variant="ghost">
        Tümünü Temizle
      </Button>
    </div>
  );
}
