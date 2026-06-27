'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/owuan/types';
import { formatPrice } from '@/actions';
import { useWishlistStore } from '@/lib/owuan/stores';
import { useAuth } from '@/components/auth';
import { useAuthPrompt } from '@/components/auth-prompt-dialog';
import { cn } from '@/lib/utils';

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
  useEffect(() => setMounted(true), []);
  const isWishlisted = mounted && isInWishlist(product.id);

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const originalPrice = product.discount
    ? price / (1 - product.discount / 100)
    : null;
  const badgeImage = product.campaignBadges?.find((b) => b.badgeImage)?.badgeImage;

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
    <Link
      href={`/urun/${product.handle}`}
      className={cn("group relative block", cardStyle === "minimal" && "space-y-2")}
    >
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-secondary",
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
                YENİ
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

        {/* Campaign badge image (top-right corner) */}
        {badgeImage && (
          <div className="absolute right-2 top-2 h-12 w-12 sm:h-14 sm:w-14">
            <Image
              src={badgeImage}
              alt="Kampanya"
              fill
              sizes="56px"
              className="object-contain drop-shadow-sm"
            />
          </div>
        )}

        {/* Wishlist Button */}
        {cardStyle !== "minimal" && (
          <button
            onClick={handleWishlistClick}
            className={cn(
              'absolute right-3 flex h-9 w-9 items-center justify-center rounded-(--radius) bg-background/80 backdrop-blur-sm transition-all hover:bg-background',
              badgeImage ? 'top-16 sm:top-[4.5rem]' : 'top-3',
              isWishlisted && 'text-rose-600'
            )}
            aria-label={isWishlisted ? 'Favorilerden çıkar' : 'Favorilere ekle'}
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
            {product.brand && !/^\d+$/.test(product.brand) ? (
              <p className="text-xs text-white/70">{product.brand}</p>
            ) : null}
            <span className="text-sm font-semibold text-white">
              {formatPrice(product.priceRange.minVariantPrice.amount)}
            </span>
          </div>
        )}

        {/* Classic Quick View */}
        {cardStyle === "classic" && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/90 py-3 text-center text-sm font-medium text-background transition-transform duration-300 group-hover:translate-y-0">
            Hızlı Bakış
          </div>
        )}
      </div>

      {/* Info below image (classic & minimal) */}
      {cardStyle !== "modern" && (
        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-1">
            {product.title}
          </h3>
          {cardStyle === "classic" && product.brand && !/^\d+$/.test(product.brand) ? (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          ) : null}
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
        </div>
      )}
    </Link>
  );
}
