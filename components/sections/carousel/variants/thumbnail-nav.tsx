"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface CarouselData {
  title?: string;
  images: { url: string; alt?: string; linkUrl?: string }[];
  variant?: string;
}

export function CarouselThumbnailNav({ data }: { data: CarouselData }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {data.title && (
        <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-8">
          {data.title}
        </h2>
      )}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {data.images.map((img, ii) => (
            <CarouselItem key={ii}>
              {img.linkUrl ? (
                <Link href={img.linkUrl} className="block relative aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={img.url}
                    alt={img.alt || `Slide ${ii + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 80vw, 100vw"
                  />
                </Link>
              ) : (
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={img.url}
                    alt={img.alt || `Slide ${ii + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 80vw, 100vw"
                  />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>
      <div className="flex justify-center gap-2 mt-4">
        {data.images.map((img, ii) => (
          <button
            key={ii}
            onClick={() => api?.scrollTo(ii)}
            className={`relative w-16 h-10 rounded overflow-hidden border-2 transition-colors ${
              ii === current ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt || `Thumbnail ${ii + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
