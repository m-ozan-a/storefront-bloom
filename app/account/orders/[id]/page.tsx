'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getOrder, type OrderDetail } from '@/actions';
import { formatPrice } from '@/actions';
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

const paymentLabel: Record<string, string> = {
  pending: 'Ödeme Bekliyor',
  completed: 'Ödendi',
  refunded: 'İade Edildi',
  partially_refunded: 'Kısmen İade Edildi',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
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
    if (mounted && user && id) {
      setIsLoading(true);
      setError('');
      getOrder(id)
        .then(setOrder)
        .catch(() => setError('Failed to load order details.'))
        .finally(() => setIsLoading(false));
    }
  }, [mounted, user, id]);

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

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {error || 'Sipariş bulunamadı'}
          </h2>
          <Button asChild className="mt-6">
            <Link href="/account/orders">Siparişlere Dön</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Order #{order.orderId}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={statusVariant[order.status] || 'default'} className="text-sm px-3 py-1.5">
          {statusLabel[order.status] || order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Ödeme</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {paymentLabel[order.paymentStatus] || order.paymentStatus}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Sipariş</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusLabel[order.status] || order.status}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Teslimat</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {deliveryLabel[order.deliveryStatus] || order.deliveryStatus}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">
            Items ({order.items.length})
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.uid} className="flex gap-4 py-4">
                <Link
                  href={item.slug ? `/urun/${item.slug}` : '#'}
                  className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                >
                  {item.featuredImage ? (
                    <Image
                      src={item.featuredImage}
                      alt={item.title || 'Ürün'}
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
                      {item.slug ? (
                        <Link
                          href={`/urun/${item.slug}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {item.title || 'Ürün'}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">
                          {item.title || 'Ürün'}
                        </span>
                      )}
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      {formatPrice((item.price * item.quantity).toFixed(2))}
                    </span>
                  </div>
                  <div className="mt-auto text-xs text-muted-foreground">
                    {formatPrice(item.price.toFixed(2))} each
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary + Address */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Order Summary
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span className="text-foreground">
                  {formatPrice(order.total.toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kargo</span>
                <span className="text-foreground">
                  {order.shippingTotal > 0
                    ? formatPrice(order.shippingTotal.toFixed(2))
                    : 'Ücretsiz'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vergi</span>
                <span className="text-foreground">
                  {formatPrice(order.totalTax.toFixed(2))}
                </span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(order.totalDiscount.toFixed(2))}</span>
                </div>
              )}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Toplam</span>
                  <span>
                    {formatPrice(
                      (order.total + order.shippingTotal + order.totalTax - order.totalDiscount).toFixed(2)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="rounded-lg border border-border p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
              <div className="mt-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.address.title}</p>
                <p>{order.address.address}</p>
                <p>
                  {order.address.city}, {order.address.state}{' '}
                  {order.address.zip}
                </p>
                <p>{order.address.country}</p>
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="rounded-lg border border-border p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="h-4 w-4" />
                Tracking
              </h3>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Carrier:{' '}
                  <span className="font-medium text-foreground">
                    {order.trackingCarrier || 'N/A'}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Number:{' '}
                  <span className="font-medium text-foreground">
                    {order.trackingNumber}
                  </span>
                </p>
                {order.trackingUrl && (
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      Track Package
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Order Note */}
          {order.note && (
            <div className="rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground">
                Order Note
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
