'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Undo2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getReturns, formatPrice, type ReturnListItem } from '@/actions';
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

export default function ReturnsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [returns, setReturns] = useState<ReturnListItem[]>([]);
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
    if (mounted && user) {
      setIsLoading(true);
      getReturns()
        .then(setReturns)
        .finally(() => setIsLoading(false));
    }
  }, [mounted, user]);

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

  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Hesabıma Dön
      </Link>

      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">İadelerim</h1>

      {returns.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Undo2 className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            İade talebiniz bulunmuyor
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Teslim edilen siparişleriniz için sipariş detayından iade talebi oluşturabilirsiniz.
          </p>
          <Button asChild className="mt-6">
            <Link href="/account/orders">Siparişlerime Git</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {returns.map((item) => (
            <Link
              key={item.id}
              href={`/account/returns/${item.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Undo2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Sipariş #{item.orderId}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant={returnStatusVariant[item.status] || 'default'} className="text-xs">
                      {returnStatusLabel[item.status] || item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.refundedAmount != null && item.refundedAmount > 0 && (
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatPrice(item.refundedAmount.toFixed(2))}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
