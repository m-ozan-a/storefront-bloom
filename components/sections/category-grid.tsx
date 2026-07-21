import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Paylaşılan presentational component — codegen üretilen sayfa (getManifest ile
// sunucuda çekip prop geçer) bunu import eder. Hook içermez →
// hem server hem client contextinde render edilir. Kategori listesini + props'u tam
// alıp slice'ı BURADA yapar → render ↔ codegen parite garanti (tek yerde mantık).

export interface CategoryGridItem {
  title: string;
  slug: string;
  image?: string | null;
}

interface CategoryGridData {
  title?: string;
  columns?: "2" | "3" | "4";
  maxItems?: number;
  // Katalog CategoryGrid.variant karşılığı. "cards" = overlay kart (default).
  // "basic" = görsel üstte, başlık altta. mosaic/split/carousel → cards'a düşer.
  variant?: "cards" | "basic" | "mosaic" | "split" | "carousel";
  categories: CategoryGridItem[];
}

const CATEGORY_GRID_COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export function CategoryGridSection({ data }: { data: CategoryGridData }) {
  const cols = data.columns ?? "4";
  const items = data.maxItems ? data.categories.slice(0, data.maxItems) : data.categories;
  if (items.length === 0) return null;
  const gridCls = CATEGORY_GRID_COLS[cols] ?? CATEGORY_GRID_COLS["4"];
  const variant = data.variant === "basic" ? "basic" : "cards";

  if (variant === "basic") {
    return (
      <section className="w-full px-5 py-5">
        <div className={`grid gap-4 ${gridCls}`}>
          {items.map((cat) => (
            <Link key={cat.slug} href={`/search/${cat.slug}`} className="group block">
              <Card className="overflow-hidden rounded-lg border-0 bg-muted p-0">
                <AspectRatio ratio={4 / 3}>
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                      <span className="font-serif text-5xl font-bold text-primary/25">
                        {cat.title.charAt(0).toLocaleUpperCase("tr")}
                      </span>
                    </div>
                  )}
                </AspectRatio>
              </Card>
              <div className="mt-3 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">{cat.title}</h3>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-5 py-5">
      <div className={`grid gap-4 ${gridCls}`}>
        {items.map((cat) => (
          <Link key={cat.slug} href={`/search/${cat.slug}`} className="group block">
            <Card className="relative overflow-hidden rounded-lg border-0 bg-muted p-0">
              <AspectRatio ratio={4 / 3}>
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                    <span className="font-serif text-5xl font-bold text-primary/25">
                      {cat.title.charAt(0).toLocaleUpperCase("tr")}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/10 to-transparent transition-colors duration-300 group-hover:from-foreground/75" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                  <h3 className="text-base font-semibold text-background md:text-lg">
                    {cat.title}
                  </h3>
                  <ArrowUpRight className="size-5 shrink-0 -translate-x-1 translate-y-1 text-background/0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-background" />
                </div>
              </AspectRatio>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
