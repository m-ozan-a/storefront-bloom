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

// Spec kontratı: collection/tag verilirse ürünler wrapper içinde filtrelenir,
// maxItems verilirse kesilir. Verilmezse davranış değişmez (filtre yok).
function applyConfig(carousel: CarouselConfig): Product[] {
  let list = carousel.products;
  if (carousel.collection) {
    list = list.filter((p) =>
      p.collections ? p.collections.some((c) => c.slug === carousel.collection) : true
    );
  }
  if (carousel.tag) {
    list = list.filter(
      (p) => p.tags.includes(carousel.tag!) || (p.labels ?? []).some((l) => l.slug === carousel.tag)
    );
  }
  if (carousel.maxItems && carousel.maxItems > 0) list = list.slice(0, carousel.maxItems);
  return list;
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
        <section key={ci} className="w-full px-5 py-5">
          {carousel.collection && (
            <div className="flex justify-end">
              <Button asChild variant="link" className="hidden px-0 sm:inline-flex">
                <Link href={`/search/${carousel.collection}`}>
                  Tümünü Gör <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          <Carousel className="w-full" opts={{ align: "start", slidesToScroll: "auto" }}>
            <CarouselContent className="-ml-4">
              {applyConfig(carousel).map((product) => (
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
