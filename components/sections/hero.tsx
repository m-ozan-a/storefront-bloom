import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroData {
  heading: string;
  subheading?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
}

export function HeroSection({ data }: { data: HeroData }) {
  const hasImage = Boolean(data.imageUrl);
  return (
    <section className="relative w-full overflow-hidden">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl as string}
          alt={data.heading}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {hasImage ? <div className="absolute inset-0 bg-foreground/40" /> : null}

      <div
        className={`container relative mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center ${
          hasImage ? "text-background" : "text-foreground"
        }`}
      >
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {data.heading}
        </h1>
        {data.subheading ? (
          <p
            className={`max-w-xl text-lg ${
              hasImage ? "text-background/80" : "text-muted-foreground"
            }`}
          >
            {data.subheading}
          </p>
        ) : null}
        {data.ctaText && data.ctaUrl ? (
          <Button asChild size="lg" className="mt-2">
            <Link href={data.ctaUrl}>
              {data.ctaText} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
