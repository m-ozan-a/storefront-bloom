import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface CarouselData {
  title?: string;
  images: { url: string; alt?: string; linkUrl?: string }[];
  variant?: string;
}

export function CarouselFullWidth({ data }: { data: CarouselData }) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {data.title && (
        <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-8">
          {data.title}
        </h2>
      )}
      <Carousel className="w-full">
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
    </div>
  );
}
