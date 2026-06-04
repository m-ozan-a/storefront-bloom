'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderId') || '-';

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-600" />
      </div>
      <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
        Siparişiniz Alındı!
      </h1>
      <p className="mt-4 text-muted-foreground">
        Siparişiniz başarıyla alındı. En kısa sürede işleme alınacaktır.
      </p>

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

      <p className="mt-6 text-sm text-muted-foreground">
        Sipariş detaylarınız ve kargo takip bilgisi e-posta adresinize gönderilecektir.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/search">Alışverişe Devam Et</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <Suspense fallback={
        <div className="mx-auto max-w-lg text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-serif font-bold text-foreground">
            Siparişiniz Alındı!
          </h1>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
