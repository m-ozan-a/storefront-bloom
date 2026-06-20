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

export function HeroCentered({ data }: { data: HeroData }) {
  return (
    <section className="relative h-screen min-h-[600px]">
      {data.videoUrl ? (
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            poster={data.imageUrl}
          >
            <source src={data.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-foreground/30" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <Image
            src={data.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop"}
            alt={data.heading}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </div>
      )}
      <div className="relative container mx-auto flex h-full items-center px-4">
        <div className="max-w-xl">
          {data.subheading && (
            <span className="text-sm font-medium uppercase tracking-widest text-background/90">
              {data.subheading}
            </span>
          )}
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-background md:text-6xl lg:text-7xl text-balance">
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
      </div>
    </section>
  );
}
