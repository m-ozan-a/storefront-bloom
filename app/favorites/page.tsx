'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { formatPrice } from '@/actions';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { favorites, loading, enabled, toggleFavorite } = useFavorites();

  if (!enabled) {
    return (
      <main className="flex min-h-[60vh] w-full flex-col items-center justify-center px-5 py-5 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Favorileriniz</h1>
        <p className="mt-2 text-muted-foreground">Favorilerinizi görmek için giriş yapın.</p>
        <Button asChild className="mt-6">
          <Link href="/account/login">Giriş Yap</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="w-full px-5 py-5">
      <h1 className="mb-5 font-serif text-2xl font-bold text-foreground md:text-3xl">Favorilerim</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Heart className="h-16 w-16 text-muted-foreground/40" />
          <p className="mt-6 text-lg font-medium text-foreground">Henüz favori ürününüz yok</p>
          <Button asChild className="mt-6">
            <Link href="/search">Alışverişe Başla</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {favorites.map((fav) =>
            fav.product ? (
              <div key={fav.id} className="group relative">
                <Link href={`/urun/${fav.product.handle}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                    {fav.product.featuredImage ? (
                      <Image
                        src={fav.product.featuredImage.url}
                        alt={fav.product.featuredImage.altText || fav.product.title}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-foreground line-clamp-1">
                    {fav.product.title}
                  </h3>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(fav.product.priceRange.minVariantPrice.amount)}
                  </span>
                </Link>
                <button
                  onClick={() => toggleFavorite(fav.product!.id)}
                  aria-label="Favorilerden çıkar"
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-destructive backdrop-blur-sm transition-all hover:bg-background"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>
            ) : null
          )}
        </div>
      )}
    </main>
  );
}
