'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, Truck, RotateCcw, Shield, Loader2, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/owuan/types';
import { formatPrice } from '@/actions';
import { useCartStore, useWishlistStore } from '@/lib/owuan/stores';
import { useAuth } from '@/components/auth';
import { useAuthPrompt } from '@/components/auth-prompt-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((option) => {
      initial[option.name] = option.values[0];
    });
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  const { addItem, isLoading, error, clearError } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isWishlisted = mounted && isInWishlist(product.id);

  const selectedVariant = product.variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    )
  ) || product.variants[0];

  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const originalPrice = selectedVariant?.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice.amount)
    : null;

  const hasVariants = product.variants.length > 0;
  const inStock = selectedVariant ? selectedVariant.availableForSale : product.availableForSale;

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) return;
    await addItem(product, selectedVariant?.id ?? '', quantity);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      openPrompt();
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Brand & Title */}
      <div>
        {product.brand && !/^\d+$/.test(product.brand) ? (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">
          {product.title}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(price.toFixed(2))}
        </span>
        {originalPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(originalPrice.toFixed(2))}
          </span>
        )}
      </div>

      {/* Campaign Badges */}
      {product.campaignBadges && product.campaignBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.campaignBadges.map((badge) =>
            badge.badgeImage ? (
              <div key={badge.campaignUid} className="relative h-16 w-16">
                <Image
                  src={badge.badgeImage}
                  alt={badge.label}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span key={badge.campaignUid} className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                {badge.label}
              </span>
            )
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-muted-foreground">{product.description}</p>

      {/* Labels (etiketler → filtre) */}
      {product.labels && product.labels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.labels.map((l) => (
            <Link
              key={l.slug}
              href={`/search?label=${encodeURIComponent(l.slug)}`}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {l.title}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Options */}
      <div className="space-y-4">
        {product.options.map((option) => (
          <div key={option.id}>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {option.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [option.name]: value,
                    }))
                  }
                  className={cn(
                    'min-w-[3rem] rounded-md border px-4 py-2 text-sm transition-colors',
                    selectedOptions[option.name] === value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Adet
        </label>
        <div className="flex w-fit items-center rounded-md border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label="Adet azalt"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label="Adet artır"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={clearError} className="flex-shrink-0 hover:opacity-70">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          className="flex-1 h-12 text-base"
          disabled={!inStock || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : inStock ? (
            'Sepete Ekle'
          ) : (
            'Stokta Yok'
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-12 w-12', isWishlisted && 'text-destructive')}
          onClick={handleWishlistToggle}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
        </Button>
      </div>

      {/* Features */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Truck className="h-5 w-5" />
          <span>150 ₺ üzeri ücretsiz kargo</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <RotateCcw className="h-5 w-5" />
          <span>30 gün ücretsiz iade</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span>2 yıl garanti</span>
        </div>
      </div>
    </div>
  );
}
