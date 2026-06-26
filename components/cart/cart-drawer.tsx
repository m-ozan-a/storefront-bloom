'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/owuan/stores';
import { formatPrice } from '@/lib/owuan';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, isLoading, error, clearError, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCart();
    }
  }, [mounted, fetchCart]);

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            Sepetim ({cart.totalQuantity})
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </SheetTitle>
        </SheetHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={clearError} className="flex-shrink-0 hover:opacity-70">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Sepetiniz boş
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Alışverişe başlamak için ürün ekleyin
              </p>
            </div>
            <Button onClick={closeCart} asChild>
              <Link href="/search">Alışverişe Devam Et</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-4">
                {cart.lines.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <Link
                      href={`/urun/${item.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                    >
                      {item.merchandise.product.featuredImage?.url ? (
                        <Image
                          src={item.merchandise.product.featuredImage.url}
                          alt={item.merchandise.product.title}
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
                            href={`/urun/${item.merchandise.product.handle}`}
                            onClick={closeCart}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {item.merchandise.product.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.merchandise.selectedOptions
                              .map((o) => o.value)
                              .join(' / ')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          aria-label="Ürünü çıkar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isLoading}
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                            aria-label="Adet azalt"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isLoading}
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                            aria-label="Adet artır"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(item.cost.totalAmount.amount)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(cart.cost.subtotalAmount.amount)}
                  </span>
                </div>
                {cart.cost.totalTaxAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vergi</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(cart.cost.totalTaxAmount.amount)}
                    </span>
                  </div>
                )}
                {cart.appliedCampaigns && cart.appliedCampaigns.length > 0
                  ? cart.appliedCampaigns.map((c) => (
                      <div key={c.uid} className="flex justify-between text-sm text-emerald-600">
                        <span className="truncate pr-2">{c.title}</span>
                        <span>-{formatPrice(c.discountApplied.toFixed(2))}</span>
                      </div>
                    ))
                  : null}
                <div className="flex justify-between text-base font-semibold">
                  <span>Toplam</span>
                  <span>{formatPrice(cart.cost.totalAmount.amount)}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Kargo ödeme adımında hesaplanır
              </p>
              <Button className="mt-4 w-full h-12" asChild disabled={isLoading}>
                <Link href="/checkout" onClick={closeCart}>
                  Ödemeye Geç
                </Link>
              </Button>
              <Button variant="outline" className="mt-2 w-full" asChild>
                <Link href="/sepet" onClick={closeCart}>
                  Sepeti Görüntüle
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
