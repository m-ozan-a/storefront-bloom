import { Quote } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Hook-free presentational — json-render registry + codegen server sayfası ortak import eder.
export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string | null;
  avatarUrl?: string | null;
}

interface TestimonialsData {
  title?: string;
  items: TestimonialItem[];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialsSection({ data }: { data: TestimonialsData }) {
  if (data.items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-16">
      {data.title ? (
        <h2 className="mb-10 text-center font-serif text-3xl font-bold text-foreground">
          {data.title}
        </h2>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((t, i) => (
          <Card key={i} className="justify-between">
            <CardContent>
              <Quote className="size-7 text-primary/30" aria-hidden="true" />
              <blockquote className="mt-3 text-foreground/90 leading-relaxed">
                {t.quote}
              </blockquote>
            </CardContent>
            <CardFooter className="gap-3">
              <Avatar>
                {t.avatarUrl ? <AvatarImage src={t.avatarUrl} alt={t.author} /> : null}
                <AvatarFallback>{initials(t.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium text-foreground">{t.author}</div>
                {t.role ? (
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                ) : null}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
