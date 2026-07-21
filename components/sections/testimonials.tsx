import { Quote, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Hook-free presentational — codegen üretilen server sayfası import eder.
export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
}

interface TestimonialsData {
  eyebrow?: string | null;
  title?: string;
  items: TestimonialItem[];
}

export type TestimonialsVariant = "cards" | "spotlight" | "masonry";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating?: number | null }) {
  const value = Math.round(rating ?? 5);
  return (
    <div className="flex gap-0.5" aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < value
              ? "fill-primary text-primary"
              : "fill-muted text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function SectionHeader({ data }: { data: TestimonialsData }) {
  if (!data.title && !data.eyebrow) return null;
  return (
    <div className="mb-12 flex flex-col items-center gap-3 text-center">
      {data.eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {data.eyebrow}
        </span>
      ) : null}
      {data.title ? (
        <h2 className="max-w-2xl font-serif text-3xl font-bold text-foreground md:text-4xl">
          {data.title}
        </h2>
      ) : null}
    </div>
  );
}

function PersonRow({ item }: { item: TestimonialItem }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        {item.avatarUrl ? (
          <AvatarImage src={item.avatarUrl} alt={item.author} />
        ) : null}
        <AvatarFallback>{initials(item.author)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-medium text-foreground">{item.author}</div>
        {item.role ? (
          <div className="text-sm text-muted-foreground">{item.role}</div>
        ) : null}
      </div>
    </div>
  );
}

function CardsTestimonials({ data }: { data: TestimonialsData }) {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <SectionHeader data={data} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((t, i) => (
          <Card
            key={i}
            className="justify-between border-border/60 transition-shadow hover:shadow-lg"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Quote
                  className="size-8 text-primary/25"
                  aria-hidden="true"
                />
                <Stars rating={t.rating} />
              </div>
              <blockquote className="text-foreground/90 leading-relaxed">
                {t.quote}
              </blockquote>
            </CardContent>
            <CardFooter>
              <PersonRow item={t} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SpotlightTestimonials({ data }: { data: TestimonialsData }) {
  const [lead, ...rest] = data.items;
  return (
    <section className="w-full bg-muted/40 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <SectionHeader data={data} />
        <figure className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-background p-8 shadow-sm md:p-14">
          <Quote
            className="absolute -right-4 -top-4 size-28 text-primary/10"
            aria-hidden="true"
          />
          <Stars rating={lead.rating} />
          <blockquote className="mt-6 font-serif text-2xl font-medium leading-snug text-foreground md:text-3xl">
            “{lead.quote}”
          </blockquote>
          <figcaption className="mt-8">
            <PersonRow item={lead} />
          </figcaption>
        </figure>
        {rest.length ? (
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
            {rest.slice(0, 2).map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-background p-6"
              >
                <Stars rating={t.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {t.quote}
                </blockquote>
                <div className="mt-4">
                  <PersonRow item={t} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MasonryTestimonials({ data }: { data: TestimonialsData }) {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <SectionHeader data={data} />
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {data.items.map((t, i) => (
          <figure
            key={i}
            className="break-inside-avoid rounded-xl border border-border/60 bg-background p-6 shadow-sm"
          >
            <Stars rating={t.rating} />
            <blockquote className="mt-4 leading-relaxed text-foreground/90">
              {t.quote}
            </blockquote>
            <figcaption className="mt-5 border-t border-border/50 pt-4">
              <PersonRow item={t} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSection({
  data,
  variant = "cards",
}: {
  data: TestimonialsData;
  variant?: TestimonialsVariant;
}) {
  if (data.items.length === 0) return null;
  if (variant === "spotlight") return <SpotlightTestimonials data={data} />;
  if (variant === "masonry") return <MasonryTestimonials data={data} />;
  return <CardsTestimonials data={data} />;
}
