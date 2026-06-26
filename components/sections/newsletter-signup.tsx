import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

// Paylaşılan presentational wrapper — interaktif (POST) kısmı zaten var olan
// NewsletterForm ("use client", subscribeToNewsletter → /storefront/newsletter/subscribe).
// Bu wrapper sadece başlık/alt başlık sunar, formu child olarak gömer. Hem json-render
// registry (components.tsx) hem codegen üretilen server sayfası bunu import eder;
// NewsletterForm client component olarak server sayfasında sorunsuz child kalır.

interface NewsletterSignupData {
  title?: string;
  subtitle?: string;
}

export function NewsletterSignupSection({ data }: { data: NewsletterSignupData }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-2xl border-border/60 bg-muted/30">
          <CardContent className="flex flex-col items-center px-6 py-4 text-center sm:px-10">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
              {data.title ?? "Bültenimize katılın"}
            </h2>
            {data.subtitle ? (
              <p className="mt-2 text-muted-foreground">{data.subtitle}</p>
            ) : null}
            <div className="mt-6 w-full max-w-md">
              <NewsletterForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
