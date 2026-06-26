import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Paylaşılan presentational component — hem json-render registry (components.tsx,
// state'ten kategori alır) hem codegen üretilen sayfa (owuan/mastra/tools/codegen-tools.ts,
// getManifest ile sunucuda çekip prop geçer) bunu import eder. Hook içermez →
// hem server hem client context'inde render edilir. Kategori listesini + props'u tam
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
  return (
    <section className="container mx-auto px-4 py-16">
      {data.title && (
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-foreground">
          {data.title}
        </h2>
      )}
      <div className={`grid gap-4 ${gridCls}`}>
        {items.map((cat) => (
          <Link key={cat.slug} href={`/search/${cat.slug}`} className="group block">
            <Card className="relative overflow-hidden rounded-lg border-0 bg-muted p-0">
              <AspectRatio ratio={4 / 3}>
                {cat.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent transition-colors group-hover:from-foreground/70" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                  <h3 className="text-lg font-bold text-background">{cat.title}</h3>
                  <ArrowUpRight className="size-5 shrink-0 text-background/0 transition-all group-hover:text-background" />
                </div>
              </AspectRatio>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
