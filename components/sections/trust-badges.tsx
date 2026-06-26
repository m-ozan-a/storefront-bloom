import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, hasLucideIcon } from "./lucide-icon";

// Hook-free presentational — json-render registry + codegen server sayfası ortak import eder.
export interface TrustBadgeItem {
  icon?: string | null;
  title: string;
  description?: string | null;
}

interface TrustBadgesData {
  items: TrustBadgeItem[];
}

export function TrustBadgesSection({ data }: { data: TrustBadgesData }) {
  if (data.items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.items.map((badge, i) => (
          <Card key={i} className="border-border/60 shadow-none">
            <CardContent className="flex items-center gap-4 px-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {hasLucideIcon(badge.icon) ? (
                  <LucideIcon name={badge.icon} className="size-5" />
                ) : (
                  <span className="text-2xl leading-none">{badge.icon ?? "✓"}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium leading-tight text-foreground">{badge.title}</p>
                {badge.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{badge.description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
