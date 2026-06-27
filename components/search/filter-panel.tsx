"use client";

import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useFilterParams } from "@/hooks/use-filter-params";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  categories: { label: string; value: string }[];
  brands: { label: string; value: string }[];
  sizes: string[];
  colors: string[];
  priceRange: { min: number; max: number };
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        className="flex w-full items-center justify-between py-2 text-sm font-semibold"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        {title}
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {expanded && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function FilterPanel({ options }: { options: FilterOptions }) {
  const { filters, activeFilterCount, toggleArrayFilter, setFilter, clearAllFilters } =
    useFilterParams();
  const [open, setOpen] = useState(false);

  const [minPriceInput, setMinPriceInput] = useState(
    filters.minPrice !== null ? String(filters.minPrice) : ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxPrice !== null ? String(filters.maxPrice) : ""
  );

  const handlePriceApply = () => {
    const min = minPriceInput ? Number(minPriceInput) : null;
    const max = maxPriceInput ? Number(maxPriceInput) : null;
    setFilter("minPrice", min !== null ? String(min) : null);
    setFilter("maxPrice", max !== null ? String(max) : null);
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
          </svg>
          Filtrele
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 rounded-full px-1 text-[10px]" variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col px-6 py-6 sm:max-w-md" side="right">
        <SheetHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Filtreler</SheetTitle>
            {activeFilterCount > 0 && (
              <Button onClick={clearAllFilters} size="sm" variant="ghost">
                Tümünü Temizle
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-1 overflow-y-auto py-4">

          {/* Category */}
          {options.categories.length > 0 && (
            <>
              <FilterSection title="Kategori">
                <div className="grid gap-2">
                  {options.categories.map((cat) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm"
                      key={cat.value}
                    >
                      <Checkbox
                        checked={filters.category.includes(cat.value)}
                        className="size-4"
                        onCheckedChange={() => toggleArrayFilter("category", cat.value)}
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </>
          )}

          {/* Brand */}
          {options.brands.length > 0 && (
            <>
              <FilterSection title="Marka">
                <div className="grid gap-2">
                  {options.brands.map((b) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm"
                      key={b.value}
                    >
                      <Checkbox
                        checked={filters.brand.includes(b.value)}
                        className="size-4"
                        onCheckedChange={() => toggleArrayFilter("brand", b.value)}
                      />
                      {b.label}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </>
          )}

          {/* Price Range */}
          <FilterSection title="Fiyat Aralığı">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 text-sm"
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder={String(options.priceRange.min)}
                  type="number"
                  value={minPriceInput}
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  className="h-8 text-sm"
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder={String(options.priceRange.max)}
                  type="number"
                  value={maxPriceInput}
                />
              </div>
              <Button
                className="h-7 w-full text-xs"
                onClick={handlePriceApply}
                size="sm"
                variant="secondary"
              >
                Uygula
              </Button>
            </div>
          </FilterSection>

          {/* Size */}
          {options.sizes.length > 0 && (
            <>
              <FilterSection title="Beden">
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((s) => {
                    const isSelected = filters.size.includes(s);
                    return (
                      <button
                        className={`flex h-8 min-w-[44px] items-center justify-center rounded-md border px-3 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/30"
                        }`}
                        key={s}
                        onClick={() => toggleArrayFilter("size", s)}
                        type="button"
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>
            </>
          )}

          {/* Color */}
          {options.colors.length > 0 && (
            <>
              <FilterSection title="Renk">
                <div className="grid gap-2">
                  {options.colors.map((c) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm"
                      key={c}
                    >
                      <Checkbox
                        checked={filters.color.includes(c)}
                        className="size-4"
                        onCheckedChange={() => toggleArrayFilter("color", c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </>
          )}
        </div>

        {/* Apply button at bottom */}
        <div className="shrink-0 border-t border-border pt-4">
          <Button className="w-full" onClick={() => setOpen(false)} size="sm">
            Sonuçları Göster
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
