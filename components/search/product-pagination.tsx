"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/lib/filter-params";

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

interface ProductPaginationProps {
  total: number;
}

export function ProductPagination({ total }: ProductPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page") || 1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    setPage(currentPage + 1);
  };

  if (total <= PAGE_SIZE) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="mt-8 space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Showing {showingFrom}–{showingTo} of {total} products
      </p>

      {/* Load more button */}
      {currentPage < totalPages && (
        <div className="flex justify-center">
          <Button
            className="gap-2"
            onClick={handleLoadMore}
            size="lg"
            variant="outline"
          >
            Load more
          </Button>
        </div>
      )}

      {/* Page numbers */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              href={currentPage > 1 ? getPageHref(pathname, searchParams, currentPage - 1) : "#"}
              onClick={(e) => {
                if (currentPage <= 1) return;
                e.preventDefault();
                setPage(currentPage - 1);
              }}
            />
          </PaginationItem>

          {visiblePages.map((page, i) => (
            <PaginationItem key={i}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={getPageHref(pathname, searchParams, page)}
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              href={currentPage < totalPages ? getPageHref(pathname, searchParams, currentPage + 1) : "#"}
              onClick={(e) => {
                if (currentPage >= totalPages) return;
                e.preventDefault();
                setPage(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function getPageHref(pathname: string, searchParams: URLSearchParams, page: number): string {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  return `${pathname}?${params.toString()}`;
}
