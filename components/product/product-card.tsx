'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/owuan/types';
import { formatPrice } from '@/lib/owuan';
import { useWishlistStore } from '@/lib/owuan/stores';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  cardStyle?: "classic" | "modern" | "minimal";
}

export function ProductCard({ product, priority = false, cardStyle = "classic" }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const originalPrice = product.discount
    ? price / (1 - product.discount / 100)
    : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeItem(product.id);
    } else {
      addItem(product.id);
    }
  };

  return (
    <Link
      href={`/product/${product.handle}`}
      className={cn("group relative block", cardStyle === "minimal" && "space-y-2")}
    >
      <div className={cn(
        "relative overflow-hidden bg-secondary",
        cardStyle === "minimal" ? "aspect-square" : "aspect-[3/4]"
      )}>
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 opacity-30" />
          </div>
        )}
        
        {/* Badges */}
        {cardStyle !== "minimal" && (
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-foreground px-2 py-1 text-xs font-medium text-background">
                NEW
              </span>
            )}
            {product.discount && (
              <span className="bg-rose-600 px-2 py-1 text-xs font-medium text-white">
                -{product.discount}%
              </span>
            )}
            {product.campaignBadges?.slice(0, 2).map((badge) => (
              <span
                key={badge.campaignUid}
                className="bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist Button */}
        {cardStyle !== "minimal" && (
          <button
            onClick={handleWishlistClick}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background',
              isWishlisted && 'text-rose-600'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn('h-5 w-5', isWishlisted && 'fill-current')}
            />
          </button>
        )}

        {/* Modern overlay info */}
        {cardStyle === "modern" && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <h3 className="text-sm font-medium text-white line-clamp-1">
              {product.title}
            </h3>
            <p className="text-xs text-white/70">{product.brand}</p>
            <span className="text-sm font-semibold text-white">
              {formatPrice(product.priceRange.minVariantPrice.amount)}
            </span>
          </div>
        )}

        {/* Classic Quick View */}
        {cardStyle === "classic" && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/90 py-3 text-center text-sm font-medium text-background transition-transform duration-300 group-hover:translate-y-0">
            Quick View
          </div>
        )}
      </div>

      {/* Info below image (classic & minimal) */}
      {cardStyle !== "modern" && (
        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-1">
            {product.title}
          </h3>
          {cardStyle === "classic" && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.priceRange.minVariantPrice.amount)}
            </span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice.toFixed(2))}
              </span>
            )}
          </div>
          
          {cardStyle === "classic" && (
            <div className="flex items-center gap-1 pt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
