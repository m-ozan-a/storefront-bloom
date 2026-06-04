'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { useWishlistStore } from '@/lib/owuan/stores';
import { products } from '@/lib/owuan/dummy-data';
import { ProductCard } from '@/components/product';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { items: wishlistItems } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/account/login');
    }
  }, [mounted, isLoading, user, router]);

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

  const wishlistProducts = wishlistItems
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean)
    .slice(0, 4);

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
              <Link
                href="/account/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
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
            <div className="rounded-lg border border-border p-4">
              <Package className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">
                {wishlistItems.length}
              </p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Saved Addresses</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <div className="mt-4 flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                You haven&apos;t placed any orders yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/search">Start Shopping</Link>
              </Button>
            </div>
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
