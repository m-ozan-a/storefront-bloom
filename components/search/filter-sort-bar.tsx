'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { sorting } from '@/lib/owuan';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterSortBarProps {
  productCount: number;
}

export function FilterSortBar({ productCount }: FilterSortBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSort = searchParams.get('sort') || '';

  const handleSortChange = (sortSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortSlug) {
      params.set('sort', sortSlug);
    } else {
      params.delete('sort');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSortLabel =
    sorting.find((s) => s.slug === currentSort)?.title || 'Relevance';

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {productCount} {productCount === 1 ? 'product' : 'products'}
      </p>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Sort: {currentSortLabel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sorting.map((option) => (
              <DropdownMenuItem
                key={option.slug || 'relevance'}
                onClick={() => handleSortChange(option.slug)}
                className={cn(
                  currentSort === (option.slug || '') && 'font-medium'
                )}
              >
                {option.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
