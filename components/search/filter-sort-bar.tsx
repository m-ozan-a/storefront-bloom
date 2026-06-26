"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { sorting } from "@/lib/owuan";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPanel, type FilterOptions } from "./filter-panel";
import { ActiveFilters } from "./active-filters";

interface FilterSortBarProps {
  filterOptions: FilterOptions;
}

export function FilterSortBar({ filterOptions }: FilterSortBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSort = searchParams.get("sort") || "";

  const handleSortChange = (sortSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortSlug) {
      params.set("sort", sortSlug);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSortLabel =
    sorting.find((s) => s.slug === currentSort)?.title || "Önerilen";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <FilterPanel options={filterOptions} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2" size="sm" variant="outline">
              Sırala: {currentSortLabel}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sorting.map((option) => (
              <DropdownMenuItem
                key={option.slug || "relevance"}
                onClick={() => handleSortChange(option.slug)}
                className={cn(
                  currentSort === (option.slug || "") && "font-medium"
                )}
              >
                {option.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ActiveFilters />
    </div>
  );
}
