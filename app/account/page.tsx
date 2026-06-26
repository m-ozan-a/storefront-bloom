'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, ChevronRight, UserCircle } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getOrders, getAddresses, getFavorites, type OrderListItem } from '@/lib/owuan/client';
import { getProductById } from '@/lib/owuan';
import type { Product } from '@/lib/owuan/types';
import { formatPrice } from '@/lib/owuan';
import { ProductCard } from '@/components/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusLabel: Record<string, string> = {
  processing: 'Hazırlanıyor',
  cancelled: 'İptal Edildi',
  returned: 'İade Edildi',
  partially_returned: 'Kısmen İade Edildi',
  waiting_return: 'İade Bekliyor',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  processing: 'default',
  cancelled: 'destructive',
  returned: 'secondary',
  partially_returned: 'secondary',
  waiting_return: 'outline',
};

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/account/login');
    }
  }, [mounted, isLoading, user, router]);

  useEffect(() => {
    if (mounted && user) {
      Promise.all([
        getOrders().then((orders) => {
          setOrderCount(orders.length);
          setRecentOrders(orders.slice(0, 5));
        }),
        getAddresses().then((list) => setAddressCount(list.length)),
        getFavorites().then((list) => {
          setFavoriteCount(list.length);
          const ids = list.slice(0, 4).map((f) => f.product?.id).filter(Boolean) as string[];
          if (ids.length > 0) {
            Promise.all(ids.map((id) => getProductById(id).catch(() => undefined)))
              .then((products) => setWishlistProducts(products.filter((p): p is Product => p != null)));
          }
        }),
      ]).catch(() => {});
    }
  }, [mounted, user]);

  if (!mounted || isLoading) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

          const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-lg border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground"
              >
                <User className="h-4 w-4" />
                Account Overview
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
              <Link
                href="/account/profile"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/account/addresses"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account and view your orders.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/account/orders" className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50">
              <Package className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">{orderCount}</p>
              <p className="text-sm text-muted-foreground">Siparişler</p>
            </Link>
            <Link href="/account/wishlist" className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">
                {favoriteCount}
              </p>
              <p className="text-sm text-muted-foreground">Favoriler</p>
            </Link>
            <Link href="/account/addresses" className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">{addressCount}</p>
              <p className="text-sm text-muted-foreground">Kayıtlı Adresler</p>
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Orders
              </h2>
              {orderCount > 0 && (
                <Link
                  href="/account/orders"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  View All
                </Link>
              )}
            </div>
            {recentOrders.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  You haven&apos;t placed any orders yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/search">Alışverişe Başla</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.uid}
                    href={`/account/orders/${order.uid}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          #{order.orderId}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Badge variant={statusVariant[order.status] || 'default'} className="text-xs">
                            {statusLabel[order.status] || order.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(order.total.toFixed(2))}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          {wishlistProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Wishlist
                </h2>
                <Link
                  href="/account/wishlist"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  View All
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {wishlistProducts.map((product) =>
                  product ? (
                    <ProductCard key={product.id} product={product} />
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
