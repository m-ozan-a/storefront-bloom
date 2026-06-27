'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/owuan/stores';
import { useCartStore } from '@/lib/owuan/stores';
import { formatPrice, getProductById } from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeItem, fetchWishlist, isLoading } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchWishlist();
    }
  }, [mounted, fetchWishlist]);

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeWishlist()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="h-5 w-5" />
            Favoriler ({items.length})
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Favori listeniz boş
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Beğendiğiniz ürünleri sonrası için kaydedin
              </p>
            </div>
            <Button onClick={closeWishlist} asChild>
              <Link href="/search">Alışverişe Başla</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <li key={item.id} className="flex gap-4">
                    <Link
                      href={`/urun/${product.handle}`}
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
                            href={`/urun/${product.handle}`}
                            onClick={closeWishlist}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {product.title}
                          </Link>
                          {product.brand && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            await removeItem(product.id);
                          }}
                          disabled={isLoading}
                          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          aria-label="Favorilerden çıkar"
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
                          onClick={async () => {
                            const fullProduct = await getProductById(product.id);
                            if (fullProduct) {
                              await addToCart(fullProduct, fullProduct.variants[0].id);
                              await removeItem(product.id);
                            }
                          }}
                        >
                          Sepete Ekle
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
