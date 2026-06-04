'use client';

import { useState } from 'react';
import { Heart, Minus, Plus, Share2, Truck, RotateCcw, Shield } from 'lucide-react';
import type { Product } from '@/lib/owuan/types';
import { formatPrice } from '@/lib/owuan';
import { useCartStore, useWishlistStore } from '@/lib/owuan/stores';
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

  const { addItem } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const selectedVariant = product.variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    )
  ) || product.variants[0];

  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const originalPrice = product.discount
    ? price / (1 - product.discount / 100)
    : null;

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant.id, quantity);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Brand & Title */}
      <div>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">
          {product.title}
        </h1>
        
        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'h-4 w-4',
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
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>
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
        {product.discount && (
          <span className="rounded bg-rose-100 px-2 py-0.5 text-sm font-medium text-rose-600">
            Save {product.discount}%
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground">{product.description}</p>

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
                    'min-w-[3rem] border px-4 py-2 text-sm transition-colors',
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
          Quantity
        </label>
        <div className="flex w-fit items-center border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          className="flex-1 h-12 text-base"
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-12 w-12', isWishlisted && 'text-rose-600')}
          onClick={handleWishlistToggle}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Features */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Truck className="h-5 w-5" />
          <span>Free shipping on orders over $150</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <RotateCcw className="h-5 w-5" />
          <span>Free 30-day returns</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span>2-year warranty</span>
        </div>
      </div>
    </div>
  );
}
