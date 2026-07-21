import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from './contact-form';

interface ContactStore {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export function ContactPage({ store }: { store: ContactStore | null }) {
  const address = store?.address ?? '';
  const phone = store?.phone ?? '';
  const email = store?.email ?? '';
  const mapSrc = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
    : null;

  return (
    <main className="container mx-auto px-4 pt-8 pb-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">İletişim</h1>
        <p className="mt-2 text-muted-foreground">
          Sorularınız için bize ulaşın, en kısa sürede dönüş yapalım.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sol: iletişim bilgileri + form */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-1">
            {address ? (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-foreground">{address}</span>
              </div>
            ) : null}
            {phone ? (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-foreground hover:underline">
                  {phone}
                </a>
              </div>
            ) : null}
            {email ? (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <a href={`mailto:${email}`} className="text-foreground hover:underline">
                  {email}
                </a>
              </div>
            ) : null}
          </div>

          <Card>
            <CardContent>
              {email ? (
                <ContactForm email={email} />
              ) : (
                <p className="text-sm text-muted-foreground">İletişim e-postası tanımlı değil.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ: harita */}
        {mapSrc ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              src={mapSrc}
              title="Harita"
              className="h-full min-h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
