"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/owuan/types";
import { formatPrice } from "@/actions";
import { useWishlistStore } from "@/lib/owuan/stores";
import { useAuth } from "@/components/auth";
import { useAuthPrompt } from "@/components/auth-prompt-dialog";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  cardStyle?: "classic" | "modern" | "minimal";
}

export function ProductCard({ product, priority = false, cardStyle = "classic" }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => setMounted(true), []);
  const isWishlisted = mounted && isInWishlist(product.id);

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const originalPrice = product.discount
    ? price / (1 - product.discount / 100)
    : null;
  const soldOut = product.availableForSale === false;
  const hoverImage = product.images?.find((img) => img.url && img.url !== product.featuredImage?.url);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openPrompt();
      return;
    }
    if (isWishlisted) {
      removeItem(product.id);
    } else {
      addItem(product.id);
    }
  };

  return (
    <div
      className="group flex flex-col w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/urun/${product.handle}`}
        className="block"
      >
        <div className="aspect-square w-full overflow-hidden bg-muted relative mb-3">
          {product.featuredImage?.url ? (
            <>
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className={cn(
                  "object-cover object-center transition-opacity duration-300",
                  hoverImage && isHovered ? "opacity-0" : "opacity-100",
                  soldOut && "opacity-60 saturate-50"
                )}
                priority={priority}
                placeholder={product.featuredImage.blurData ? "blur" : "empty"}
                blurDataURL={product.featuredImage.blurData ?? undefined}
              />
              {hoverImage ? (
                <Image
                  src={hoverImage.url}
                  alt={hoverImage.altText || product.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className={cn(
                    "object-cover object-center transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0",
                    soldOut && "opacity-0 saturate-50"
                  )}
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-30" />
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={cn(
              "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/85 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-background",
              "md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100",
              isWishlisted && "text-destructive md:translate-y-0 md:opacity-100"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </button>

          {/* Sold Out Badge */}
          {soldOut && (
            <span className="absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {product.isNew && !soldOut && (
            <span className="absolute left-3 top-3 rounded-sm bg-foreground px-2 py-1 text-xs font-medium text-background">
              NEW
            </span>
          )}
          {product.discount && !soldOut ? (
            <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
              %{product.discount} Off
            </span>
          ) : null}
        </div>

        <div className="flex text-sm justify-between items-start">
          <span className="text-foreground font-medium tracking-wide line-clamp-1">{product.title}</span>
          <span className={cn(
            "text-muted-foreground font-normal ml-2 whitespace-nowrap",
            originalPrice && "text-destructive"
          )}>
            {formatPrice(product.priceRange.minVariantPrice.amount)}
          </span>
        </div>
        {originalPrice && (
          <div className="text-xs text-muted-foreground line-through text-right">
            {formatPrice(originalPrice.toFixed(2))}
          </div>
        )}
      </Link>
    </div>
  );
}
