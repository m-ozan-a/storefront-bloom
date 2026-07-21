"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Alan adları spec ile birebir (specs/homepage.json → hero.slides).
export interface HeroSlide {
  imageUrl: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaUrl: string;
}

// Placeholder — spec/codegen slides prop'u geçmezse bu veri render edilir.
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    heading: "Yeni Sezon Geldi",
    subheading: "Özenle seçilmiş parçalarla gardırobunuzu yenileyin.",
    ctaText: "Koleksiyonu Keşfet",
    ctaUrl: "/search",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
    heading: "Şıklığın Yeni Adresi",
    subheading: "Trend tasarımlar, uygun fiyatlarla kapınızda.",
    ctaText: "Alışverişe Başla",
    ctaUrl: "/search",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1920&q=80",
    heading: "Kaçırılmayacak Fırsatlar",
    subheading: "Sezon sonu indirimleriyle favorileriniz indirimde.",
    ctaText: "Fırsatları Gör",
    ctaUrl: "/search",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
    heading: "Premium Kumaşlar",
    subheading: "Kaliteli malzeme, kusursuz dikim, dayanıklı tasarım.",
    ctaText: "Ürünleri İncele",
    ctaUrl: "/search",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80",
    heading: "Tarzını Yansıt",
    subheading: "Kendine özgü kombinlerle fark yarat.",
    ctaText: "Hemen Keşfet",
    ctaUrl: "/search",
  },
];

const AUTOPLAY_MS = 6000;

// Katalog Hero.variant karşılığı — içerik hizasını belirler.
// split-left = mevcut görünüm (default); minimal-text/fullscreen-video → centered'a düşer.
export type HeroVariant = "split-left" | "split-right" | "centered" | "minimal-text" | "fullscreen-video";

const VARIANT_ALIGN: Record<HeroVariant, { container: string; text: string; overlay: string }> = {
  "split-left": {
    container: "items-start text-left",
    text: "",
    overlay: "bg-gradient-to-r from-foreground/75 via-foreground/40 to-foreground/10",
  },
  "split-right": {
    container: "items-end text-right",
    text: "ml-auto",
    overlay: "bg-gradient-to-l from-foreground/75 via-foreground/40 to-foreground/10",
  },
  centered: { container: "items-center text-center", text: "mx-auto", overlay: "bg-foreground/45" },
  "minimal-text": { container: "items-center text-center", text: "mx-auto", overlay: "bg-foreground/45" },
  "fullscreen-video": { container: "items-center text-center", text: "mx-auto", overlay: "bg-foreground/45" },
};

export function HeroCarousel({
  slides,
  variant = "split-left",
}: {
  slides?: HeroSlide[];
  variant?: HeroVariant;
}) {
  const SLIDES = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const align = VARIANT_ALIGN[variant] ?? VARIANT_ALIGN["split-left"];
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || paused) return;
    const id = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [api, paused]);

  return (
    <Carousel
      setApi={setApi}
      className="relative w-full"
      opts={{ loop: true }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <CarouselContent className="ml-0">
        {SLIDES.map((slide, i) => (
          <CarouselItem key={i} className="pl-0 basis-full">
            <section className="relative h-[22rem] w-full overflow-hidden md:h-[32rem]">
              <Image
                src={slide.imageUrl}
                alt={slide.heading}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className={cn("absolute inset-0", align.overlay)} />
              <div className={cn("relative z-10 flex h-full w-full flex-col justify-center gap-4 px-5 md:px-16", align.container)}>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-background/70">
                  {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </p>
                <h1 className={cn("max-w-2xl font-serif text-3xl font-bold leading-tight tracking-tight text-background md:text-5xl", align.text)}>
                  {slide.heading}
                </h1>
                <p className={cn("max-w-md text-base text-background/85 md:text-lg", align.text)}>
                  {slide.subheading}
                </p>
                <div className="mt-2">
                  <Button asChild size="lg" className="group/cta">
                    <Link href={slide.ctaUrl}>
                      {slide.ctaText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 hidden border-0 bg-background/20 text-background backdrop-blur-sm hover:bg-background/40 hover:text-background sm:flex" />
      <CarouselNext className="right-4 hidden border-0 bg-background/20 text-background backdrop-blur-sm hover:bg-background/40 hover:text-background sm:flex" />
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slayt ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-background" : "w-1.5 bg-background/50 hover:bg-background/75"
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}
