import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroData {
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  variant?: string;
}

export function HeroMinimalText({ data }: { data: HeroData }) {
  return (
    <section className="container mx-auto flex items-center justify-center px-4 py-24 lg:py-32">
      <div className="max-w-2xl text-center">
        {data.subheading && (
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {data.subheading}
          </span>
        )}
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl text-balance">
          {data.heading}
        </h1>
        {data.ctaText && (
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href={data.ctaUrl || "/search"}>{data.ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
