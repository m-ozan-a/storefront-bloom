'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
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
  const { cart, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart.totalQuantity})
          </SheetTitle>
        </SheetHeader>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add items to your cart to checkout
              </p>
            </div>
            <Button onClick={closeCart} asChild>
              <Link href="/search">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-4">
                {cart.lines.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <Link
                      href={`/product/${item.merchandise.product.handle}`}
                      onClick={closeCart}
                      className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                    >
                      {item.merchandise.product.featuredImage ? (
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
                            href={`/product/${item.merchandise.product.handle}`}
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
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Remove item"
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
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                            aria-label="Decrease quantity"
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
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                            aria-label="Increase quantity"
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(cart.cost.subtotalAmount.amount)}
                  </span>
                </div>
                {cart.cost.totalTaxAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(cart.cost.totalTaxAmount.amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cart.cost.totalAmount.amount)}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Button className="mt-4 w-full h-12" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
