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
    <section className="border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          {data.title && <h2 className="text-2xl font-bold">{data.title}</h2>}
          {data.subtitle && (
            <p className="mt-3 text-muted-foreground">{data.subtitle}</p>
          )}
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
