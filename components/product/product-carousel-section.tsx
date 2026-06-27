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
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/owuan/types";

interface CarouselConfig {
  title: string;
  collection?: string;
  tag?: string;
  maxItems?: number;
  products: Product[];
}

export function ProductCarouselSection({
  carousels,
  cardStyle = "classic",
}: {
  carousels: CarouselConfig[];
  cardStyle?: "classic" | "modern" | "minimal";
}) {
  return (
    <>
      {carousels.map((carousel, ci) => (
        <section key={ci} className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              {carousel.title}
            </h2>
            {carousel.collection && (
              <Button asChild variant="link" className="hidden px-0 sm:inline-flex">
                <Link href={`/search/${carousel.collection}`}>
                  Tümünü Gör <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <Carousel className="w-full" opts={{ align: "start", slidesToScroll: "auto" }}>
            <CarouselContent className="-ml-4">
              {carousel.products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard product={product} cardStyle={cardStyle} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>
        </section>
      ))}
    </>
  );
}
