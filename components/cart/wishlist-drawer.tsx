'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/lib/owuan/stores';
import { useCartStore } from '@/lib/owuan/stores';
import { products } from '@/lib/owuan/dummy-data';
import { formatPrice } from '@/lib/owuan';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const wishlistProducts = items
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeWishlist()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="h-5 w-5" />
            Wishlist ({items.length})
          </SheetTitle>
        </SheetHeader>

        {wishlistProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Your wishlist is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save items you love for later
              </p>
            </div>
            <Button onClick={closeWishlist} asChild>
              <Link href="/search">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-4">
              {wishlistProducts.map((product) => {
                if (!product) return null;
                return (
                  <li key={product.id} className="flex gap-4">
                    <Link
                      href={`/product/${product.handle}`}
                      onClick={closeWishlist}
                      className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                    >
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/product/${product.handle}`}
                            onClick={closeWishlist}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {product.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {product.brand}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Remove from wishlist"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(product.priceRange.minVariantPrice.amount)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addToCart(product, product.variants[0].id);
                            removeItem(product.id);
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
