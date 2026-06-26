'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getOrders, type OrderListItem } from '@/lib/owuan/client';
import { formatPrice } from '@/lib/owuan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const deliveryLabel: Record<string, string> = {
  waiting: 'Kargo Bekliyor',
  shipped: 'Yolda',
  delivered: 'Teslim Edildi',
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
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
      setIsLoading(true);
      getOrders()
        .then(setOrders)
        .catch(() => setError('Failed to load orders.'))
        .finally(() => setIsLoading(false));
    }
  }, [mounted, user]);

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
        My Orders
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No orders yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders you place will appear here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/search">Alışverişe Başla</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.uid}
              href={`/account/orders/${order.uid}`}
              className="flex items-center justify-between rounded-lg border border-border p-5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    #{order.orderId}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={statusVariant[order.status] || 'default'}>
                      {statusLabel[order.status] || order.status}
                    </Badge>
                    {order.deliveryStatus && order.deliveryStatus !== 'waiting' && (
                      <span className="text-xs text-muted-foreground">
                        {deliveryLabel[order.deliveryStatus] || order.deliveryStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatPrice(order.total.toFixed(2))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
