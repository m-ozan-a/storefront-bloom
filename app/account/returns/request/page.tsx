'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Undo2, Loader2, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth';
import {
  getOrder,
  initiateReturn,
  formatPrice,
  type OrderDetail,
} from '@/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RETURN_REASONS = [
  'Ürün beklediğim gibi değil',
  'Yanlış ürün gönderildi',
  'Ürün hasarlı veya kusurlu',
  'Beden/ölçü uymadı',
  'Fikrim değişti',
  'Diğer',
];

function ReturnRequestForm() {
  const searchParams = useSearchParams();
  const orderUid = searchParams.get('order') || '';
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (mounted && user && orderUid) {
      setIsLoading(true);
      getOrder(orderUid)
        .then(setOrder)
        .finally(() => setIsLoading(false));
    } else if (mounted && user) {
      setIsLoading(false);
    }
  }, [mounted, user, orderUid]);

  const toggleItem = (itemUid: string, maxQty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[itemUid] != null) {
        delete next[itemUid];
      } else {
        next[itemUid] = maxQty;
      }
      return next;
    });
  };

  const setQty = (itemUid: string, qty: number, maxQty: number) => {
    if (qty < 1 || qty > maxQty) return;
    setSelected((prev) => ({ ...prev, [itemUid]: qty }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(selected).map(([orderItemId, quantity]) => ({
      orderItemId,
      quantity,
    }));
    if (items.length === 0) {
      setError('İade edilecek en az bir ürün seçin.');
      return;
    }
    if (!reason) {
      setError('İade sebebi seçin.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const result = await initiateReturn(orderUid, {
        reason,
        customerNote: note || undefined,
        items,
      });
      router.push(`/account/returns/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İade talebi oluşturulamadı.');
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading || (user && isLoading)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (!orderUid || !order) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
        <Undo2 className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Sipariş bulunamadı</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          İade talebi için siparişlerim sayfasından bir sipariş seçin.
        </p>
        <Button asChild className="mt-6">
          <Link href="/account/orders">Siparişlerime Git</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        İade Talebi — Sipariş #{order.orderId}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        İade etmek istediğiniz ürünleri ve adetlerini seçin.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Ürün seçimi */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border rounded-lg border border-border px-4">
            {order.items.map((item) => {
              const isChecked = selected[item.uid] != null;
              return (
                <li key={item.uid} className="flex items-center gap-4 py-4">
                  <Checkbox
                    id={`ret-${item.uid}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleItem(item.uid, item.quantity)}
                  />
                  <label htmlFor={`ret-${item.uid}`} className="flex-1 cursor-pointer">
                    <span className="font-medium text-foreground">{item.title || 'Ürün'}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {formatPrice(item.price.toFixed(2))} · Sipariş adedi: {item.quantity}
                    </span>
                  </label>
                  {isChecked && item.quantity > 1 && (
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        type="button"
                        onClick={() => setQty(item.uid, selected[item.uid] - 1, item.quantity)}
                        aria-label="Adet azalt"
                        className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-9 items-center justify-center text-sm font-medium">
                        {selected[item.uid]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.uid, selected[item.uid] + 1, item.quantity)}
                        aria-label="Adet artır"
                        className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sebep + not */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>İade Sebebi</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sebep seçin" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="returnNote">Not (isteğe bağlı)</Label>
            <Textarea
              id="returnNote"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İadeyle ilgili eklemek istedikleriniz"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            İade Talebi Oluştur
          </Button>
        </div>
      </div>
    </>
  );
}

export default function ReturnRequestPage() {
  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime Dön
      </Link>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        }
      >
        <ReturnRequestForm />
      </Suspense>
    </main>
  );
}
