import { Truck, CreditCard } from "lucide-react";

// Hook-free presentational — ürün detayında manifest'ten beslenir.
// Ana sayfa trust-badges şeridiyle aynı görsel dil: hairline bölmeli tek kutu.
interface DeliveryOptionItem {
  uid: string;
  title: string;
  description?: string | null;
  deliveryFirm?: string | null;
  deliveryFirmLogo?: string | null;
}

interface PaymentOptionItem {
  uid: string;
  title: string;
  description?: string | null;
}

export function DeliveryPaymentPanel({
  deliveryOptions,
  paymentOptions,
}: {
  deliveryOptions: DeliveryOptionItem[];
  paymentOptions: PaymentOptionItem[];
}) {
  if (deliveryOptions.length === 0 && paymentOptions.length === 0) return null;

  return (
    <aside className="grid h-fit gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
      {deliveryOptions.length > 0 && (
        <div className="bg-card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="size-4" />
            </div>
            <p className="text-sm font-semibold text-foreground">Teslimat</p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {deliveryOptions.map((opt) => (
              <li key={opt.uid} className="flex items-start gap-2.5">
                {opt.deliveryFirmLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opt.deliveryFirmLogo}
                    alt={opt.deliveryFirm ?? opt.title}
                    className="mt-0.5 h-5 w-8 shrink-0 rounded-sm object-contain"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight text-foreground">{opt.title}</p>
                  {opt.description ? (
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {opt.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {paymentOptions.length > 0 && (
        <div className="bg-card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </div>
            <p className="text-sm font-semibold text-foreground">Ödeme Seçenekleri</p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {paymentOptions.map((opt) => (
              <li key={opt.uid} className="min-w-0">
                <p className="text-sm font-medium leading-tight text-foreground">{opt.title}</p>
                {opt.description ? (
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {opt.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
