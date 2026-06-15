'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  getFavorites,
  removeFavorite,
  type FavoriteItem,
} from '@/lib/owuan/client';
import { useCartStore } from '@/lib/owuan/stores';
import { formatPrice } from '@/lib/owuan';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/account/login');
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (mounted && user) {
      loadFavorites();
    }
  }, [mounted, user]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await getFavorites();
      setItems(data.filter((f) => f.product != null));
    } catch {
      setError('Failed to load favorites.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productUid: string) => {
    await removeFavorite(productUid);
    setItems((prev) =>
      prev.filter((f) => f.product?.id !== productUid)
    );
  };

  const handleAddToCart = async (item: FavoriteItem) => {
    if (!item.product) return;
    const product = {
      id: item.product.id,
      handle: item.product.handle,
      title: item.product.title,
      description: item.product.description,
      descriptionHtml: item.product.description,
      availableForSale: item.product.availableForSale,
      options: [],
      priceRange: item.product.priceRange,
      variants: [],
      featuredImage: item.product.featuredImage || {
        url: '',
        altText: '',
        width: 0,
        height: 0,
      },
      images: [],
      seo: { title: item.product.title, description: item.product.description },
      tags: [],
      updatedAt: '',
      category: '',
      brand: '',
      rating: 0,
      reviewCount: 0,
      isNew: false,
      isBestseller: false,
    };
    await addItem(product, item.product.id);
  };

  if (!mounted || authLoading) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        My Wishlist
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Your wishlist is empty
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save items you love for later.
          </p>
          <Button asChild className="mt-6">
            <Link href="/search">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            if (!item.product) return null;
            const p = item.product;
            const price = parseFloat(p.priceRange.minVariantPrice.amount);
            const compareAt = parseFloat(p.priceRange.maxVariantPrice.amount);
            const hasDiscount = compareAt > price;

            return (
              <div
                key={item.id}
                className="group rounded-lg border border-border bg-background overflow-hidden"
              >
                <Link href={`/product/${p.handle}`} className="block">
                  <div className="relative aspect-square bg-secondary">
                    {p.featuredImage ? (
                      <Image
                        src={p.featuredImage.url}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(p.id);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
                <div className="p-3">
                  <Link
                    href={`/product/${p.handle}`}
                    className="text-sm font-medium text-foreground line-clamp-2 hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(price.toFixed(2))}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(compareAt.toFixed(2))}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleAddToCart(item)}
                    disabled={!p.availableForSale}
                  >
                    {p.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
