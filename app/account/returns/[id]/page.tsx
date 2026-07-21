'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Undo2, Truck } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getReturnDetail, formatPrice, type ReturnDetailData } from '@/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const returnStatusLabel: Record<string, string> = {
  pending_approval: 'Onay Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  in_transit: 'Kargoda',
  completed: 'Tamamlandı',
};

const returnStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_approval: 'outline',
  approved: 'default',
  rejected: 'destructive',
  in_transit: 'secondary',
  completed: 'secondary',
};

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState<ReturnDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      getReturnDetail(id)
        .then(setDetail)
        .finally(() => setIsLoading(false));
    }
  }, [mounted, user, id]);

  if (!mounted || authLoading || (user && isLoading)) {
    return (
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  if (!detail) {
    return (
      <main className="container mx-auto px-4 pt-8 pb-16">
        <Link
          href="/account/returns"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          İadelerime Dön
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Undo2 className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">İade talebi bulunamadı</h2>
          <Button asChild className="mt-6">
            <Link href="/account/returns">İadelerime Dön</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <Link
        href="/account/returns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        İadelerime Dön
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            İade Talebi — Sipariş #{detail.orderId}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(detail.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={returnStatusVariant[detail.status] || 'default'} className="text-sm px-3 py-1.5">
          {returnStatusLabel[detail.status] || detail.status}
        </Badge>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* İade edilen ürünler */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">
            İade Edilen Ürünler ({detail.items.length})
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {detail.items.map((item) => (
              <li key={item.orderItemId} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Link
                    href={`/urun/${item.product.slug}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {item.product.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">Adet: {item.quantity}</p>
                </div>
                {item.resolvedAmount != null && (
                  <span className="font-semibold text-emerald-600">
                    {formatPrice(item.resolvedAmount.toFixed(2))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Özet */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground">İade Bilgileri</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">İade Sebebi</p>
                <p className="mt-0.5 font-medium text-foreground">{detail.reason}</p>
              </div>
              {detail.customerNote && (
                <div>
                  <p className="text-muted-foreground">Notunuz</p>
                  <p className="mt-0.5 text-foreground">{detail.customerNote}</p>
                </div>
              )}
              {detail.adminNote && (
                <div>
                  <p className="text-muted-foreground">Mağaza Notu</p>
                  <p className="mt-0.5 text-foreground">{detail.adminNote}</p>
                </div>
              )}
              {detail.refundedAmount != null && detail.refundedAmount > 0 && (
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">İade Edilen Tutar</span>
                    <span className="text-emerald-600">
                      {formatPrice(detail.refundedAmount.toFixed(2))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {detail.trackingNumber && (
            <div className="rounded-lg border border-border p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="h-4 w-4" />
                Kargo Takip
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Takip No:{' '}
                <span className="font-medium text-foreground">{detail.trackingNumber}</span>
              </p>
            </div>
          )}

          <Button variant="outline" asChild className="w-full">
            <Link href={`/account/orders/${detail.orderUid}`}>Siparişi Görüntüle</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
