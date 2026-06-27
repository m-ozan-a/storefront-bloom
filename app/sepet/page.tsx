'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/owuan/stores';
import { formatPrice } from '@/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartCrossSell } from '@/components/product/cart-cross-sell';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, isLoading, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) fetchCart();
  }, [mounted, fetchCart]);

  if (!mounted) return null;

  if (cart.lines.length === 0) {
    return (
      <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 pt-32 pb-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Sepetiniz boş</h1>
        <p className="mt-2 text-muted-foreground">Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayın.</p>
        <Button asChild className="mt-6">
          <Link href="/search">Alışverişe Başla</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground md:text-4xl">
        Sepetim ({cart.totalQuantity})
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Ürünler */}
        <ul className="divide-y divide-border">
          {cart.lines.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link
                href={`/urun/${item.merchandise.product.handle}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary"
              >
                {item.merchandise.product.featuredImage?.url ? (
                  <Image
                    src={item.merchandise.product.featuredImage.url}
                    alt={item.merchandise.product.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/urun/${item.merchandise.product.handle}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {item.merchandise.product.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                    aria-label="Ürünü çıkar"
                    className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isLoading}
                      aria-label="Adet azalt"
                      className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-9 w-10 items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isLoading}
                      aria-label="Adet artır"
                      className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatPrice(item.cost.totalAmount.amount)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Özet */}
        <div>
          <Card className="sticky top-28">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Sipariş Özeti
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span className="font-medium">{formatPrice(cart.cost.subtotalAmount.amount)}</span>
              </div>
              {cart.cost.totalTaxAmount ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vergi</span>
                  <span className="font-medium">{formatPrice(cart.cost.totalTaxAmount.amount)}</span>
                </div>
              ) : null}
              {cart.appliedCampaigns && cart.appliedCampaigns.length > 0
                ? cart.appliedCampaigns.map((c) => (
                    <div key={c.uid} className="flex justify-between text-sm text-emerald-600">
                      <span className="truncate pr-2">{c.title}</span>
                      <span>-{formatPrice(c.discountApplied.toFixed(2))}</span>
                    </div>
                  ))
                : null}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Toplam</span>
                <span>{formatPrice(cart.cost.totalAmount.amount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Kargo ödeme adımında hesaplanır.</p>
              <Button asChild className="mt-2 h-12 w-full" disabled={isLoading}>
                <Link href="/checkout">Ödemeye Geç</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/search">Alışverişe Devam Et</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CartCrossSell
        productUids={[...new Set(cart.lines.map((l) => l.merchandise.product.id))]}
        hasCampaign={(cart.appliedCampaigns?.length ?? 0) > 0}
      />
    </main>
  );
}
