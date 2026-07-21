'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState } from 'react';
import { getPaymentStatus, getManifest } from '@/actions';
import type { ManifestStore } from '@/lib/owuan/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderId') || '-';
  const uid = searchParams.get('uid');
  const isBankTransfer = searchParams.get('method') === 'bank_transfer';
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [iban, setIban] = useState<ManifestStore['ibanDetails']>(null);

  useEffect(() => {
    if (!isBankTransfer) return;
    getManifest().then((m) => setIban(m.store?.ibanDetails || null)).catch(() => {});
  }, [isBankTransfer]);

  useEffect(() => {
    if (isBankTransfer || !uid) {
      setStatus('completed');
      return;
    }
    getPaymentStatus(uid)
      .then(({ status: s }) => {
        setStatus(s === 'completed' || s === 'failed' ? s : 'completed');
      })
      .catch(() => setStatus('completed'));
  }, [uid, isBankTransfer]);

  const isPending = status === 'pending';
  const isSuccess = status === 'completed';

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="flex justify-center">
        {isPending ? (
          <Loader2 className="h-20 w-20 text-muted-foreground animate-spin" />
        ) : isSuccess ? (
          <CheckCircle className="h-20 w-20 text-green-600" />
        ) : (
          <XCircle className="h-20 w-20 text-red-600" />
        )}
      </div>
      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        {isPending ? 'Ödeme Kontrol Ediliyor...' : isSuccess ? 'Siparişiniz Alındı!' : 'Ödeme Başarısız'}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {isPending
          ? 'Ödemeniz doğrulanıyor, lütfen bekleyin...'
          : isSuccess
          ? 'Siparişiniz başarıyla alındı. En kısa sürede işleme alınacaktır.'
          : 'Ödeme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.'}
      </p>

      {orderNumber !== '-' && (
        <div className="mt-8 rounded-lg border border-border p-6 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sipariş Numarası</span>
            <span className="font-semibold text-foreground">{orderNumber}</span>
          </div>
          <div className="mt-4 flex justify-between">
            <span className="text-muted-foreground">Tahmini Teslimat</span>
            <span className="font-semibold text-foreground">3-5 İş Günü</span>
          </div>
        </div>
      )}

      {isBankTransfer && iban && (
        <div className="mt-8 rounded-lg border border-border p-6 text-left">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Landmark className="h-5 w-5" />
            Havale / EFT Bilgileri
          </div>
          {iban.bankName && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Banka</span>
              <span className="font-medium text-foreground">{iban.bankName}</span>
            </div>
          )}
          {iban.accountHolder && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">Alıcı</span>
              <span className="font-medium text-foreground">{iban.accountHolder}</span>
            </div>
          )}
          {iban.iban && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">IBAN</span>
              <span className="font-medium text-foreground">{iban.iban}</span>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Açıklama kısmına sipariş numaranızı ({orderNumber}) yazmayı unutmayın. Ödemeniz onaylandığında siparişiniz işleme alınır.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        Sipariş detaylarınız ve kargo takip bilgisi e-posta adresinize gönderilecektir.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/search">Alışverişe Devam Et</Link>
        </Button>
        {!isPending && !isSuccess && (
          <Button variant="outline" asChild>
            <Link href="/checkout">Tekrar Dene</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <Suspense fallback={
        <div className="mx-auto max-w-lg text-center">
          <div className="flex justify-center">
            <Loader2 className="h-20 w-20 text-muted-foreground animate-spin" />
          </div>
          <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
            Yükleniyor...
          </h1>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
