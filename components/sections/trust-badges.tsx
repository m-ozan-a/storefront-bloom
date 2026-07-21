import { LucideIcon, hasLucideIcon } from "./lucide-icon";

// Hook-free presentational — codegen üretilen server sayfası import eder.
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
    <section className="w-full px-5 py-5">
      <div className="grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {data.items.map((badge, i) => (
          <div key={i} className="flex items-center gap-4 bg-card p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasLucideIcon(badge.icon) ? (
                <LucideIcon name={badge.icon} className="size-5" />
              ) : (
                <span className="text-2xl leading-none">{badge.icon ?? "✓"}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground">{badge.title}</p>
              {badge.description ? (
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {badge.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
