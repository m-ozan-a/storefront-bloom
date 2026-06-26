'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import type { Image as ImageType } from '@/lib/owuan/types';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ProductGalleryProps {
  images: ImageType[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-secondary text-muted-foreground">
        <ImageOff className="h-16 w-16 opacity-30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse">
      {/* Main — shadcn Carousel */}
      <Carousel setApi={setApi} opts={{ loop: true }} className="flex-1">
        <CarouselContent>
          {images.map((image, i) => (
            <CarouselItem key={i}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                <Image
                  src={image.url}
                  alt={image.altText || ''}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 ? (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        ) : null}
      </Carousel>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <div className="flex gap-2 md:w-20 md:flex-col">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Görsel ${index + 1}`}
              className={cn(
                'relative aspect-square w-16 overflow-hidden rounded-md border-2 transition-colors md:w-full',
                current === index
                  ? 'border-foreground'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <Image src={image.url} alt={image.altText} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
