import Image from "next/image";
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

export function HeroSplitRight({ data }: { data: HeroData }) {
  return (
    <section className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 py-16 lg:py-24">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg lg:order-first">
        <Image
          src={data.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop"}
          alt={data.heading}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      <div className="max-w-xl">
        {data.subheading && (
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {data.subheading}
          </span>
        )}
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl text-balance">
          {data.heading}
        </h1>
        {data.ctaText && (
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href={data.ctaUrl || "/search"}>{data.ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
