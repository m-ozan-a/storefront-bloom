"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface HeroSlide {
  image: string;
  slogan: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
}

const SLIDES: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    slogan: "Yeni Sezon Geldi",
    subtitle: "Özenle seçilmiş parçalarla gardırobunuzu yenileyin.",
    ctaText: "Koleksiyonu Keşfet",
    ctaUrl: "/search",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
    slogan: "Şıklığın Yeni Adresi",
    subtitle: "Trend tasarımlar, uygun fiyatlarla kapınızda.",
    ctaText: "Alışverişe Başla",
    ctaUrl: "/search",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1920&q=80",
    slogan: "Kaçırılmayacak Fırsatlar",
    subtitle: "Sezon sonu indirimleriyle favorileriniz indirimde.",
    ctaText: "Fırsatları Gör",
    ctaUrl: "/search",
  },
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
    slogan: "Premium Kumaşlar",
    subtitle: "Kaliteli malzeme, kusursuz dikim, dayanıklı tasarım.",
    ctaText: "Ürünleri İncele",
    ctaUrl: "/search",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80",
    slogan: "Tarzını Yansıt",
    subtitle: "Kendine özgü kombinlerle fark yarat.",
    ctaText: "Hemen Keşfet",
    ctaUrl: "/search",
  },
];

export function HeroCarousel() {
  return (
    <Carousel className="relative w-full mt-6 pt-20" opts={{ loop: true }}>
      <CarouselContent className="ml-0">
        {SLIDES.map((slide, i) => (
          <CarouselItem key={i} className="pl-0 basis-full">
            <section className="relative h-64 w-full overflow-hidden md:h-[32rem]">
              <Image
                src={slide.image}
                alt={slide.slogan}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/45" />
              <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center text-background">
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  {slide.slogan}
                </h1>
                <p className="max-w-xl text-lg text-background/85">{slide.subtitle}</p>
                <Button asChild size="lg" className="mt-2">
                  <Link href={slide.ctaUrl}>
                    {slide.ctaText} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 hidden sm:flex" />
      <CarouselNext className="right-4 hidden sm:flex" />
    </Carousel>
  );
}
