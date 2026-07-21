import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

// Paylaşılan presentational wrapper — interaktif (POST) kısmı zaten var olan
// NewsletterForm ("use client", subscribeToNewsletter → /storefront/newsletter/subscribe).
// Bu wrapper sadece başlık/alt başlık sunar, formu child olarak gömer.
// Codegen üretilen server sayfası bunu import eder;
// NewsletterForm client component olarak server sayfasında sorunsuz child kalır.

interface NewsletterSignupData {
  title?: string;
  subtitle?: string;
}

export function NewsletterSignupSection({ data }: { data: NewsletterSignupData }) {
  return (
    <section className="w-full bg-muted/50 py-5">
      <div className="flex w-full flex-col items-center px-5 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <h2 className="mt-4 font-serif text-xl font-bold text-foreground">
          {data.title ?? "Bültenimize katılın"}
        </h2>
        {data.subtitle ? (
          <p className="mt-2 text-muted-foreground">{data.subtitle}</p>
        ) : null}
        <div className="mt-6 w-full max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
