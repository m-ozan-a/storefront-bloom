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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface DiscountedProduct {
  name: string;
  imageUrl: string;
  salePrice: number;
  listPrice: number;
  discountPercent: number;
  url: string;
}

export interface DiscountedProductsData {
  title: string;
  products: DiscountedProduct[];
  variant?: "carousel" | "grid";
}

const formatPrice = (value: number) =>
  `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function DiscountedProductCard({ product }: { product: DiscountedProduct }) {
  return (
    <Card className="group overflow-hidden border-border/60 py-0">
      <Link href={product.url} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
            %{product.discountPercent}
          </Badge>
        </div>
        <CardContent className="space-y-1 p-4">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-foreground">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.listPrice)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export function DiscountedProductsSection({ data }: { data: DiscountedProductsData }) {
  const variant = data.variant ?? "carousel";

  if (data.products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">
            {data.title}
          </h2>
          {variant === "grid" ? (
            <Link
              href="/search?sort=discount"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Tümünü Gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {variant === "grid" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((p) => (
              <DiscountedProductCard key={p.url} product={p} />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start" }} className="relative">
            <CarouselContent>
              {data.products.map((p) => (
                <CarouselItem key={p.url} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <DiscountedProductCard product={p} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden sm:flex" />
            <CarouselNext className="-right-4 hidden sm:flex" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
