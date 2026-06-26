import Link from "next/link";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import type { FooterData } from "@/lib/owuan/manifest";

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: TiktokIcon,
};

export function Footer({ data }: { data: FooterData }) {
  const year = new Date().getFullYear();
  const socials = Object.entries(data.social).filter(([, url]) => !!url) as [string, string][];

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-serif font-bold">
              {data.storeName ? `${data.storeName} dünyasına katılın` : "Bültenimize abone olun"}
            </h3>
            <p className="mt-2 text-sm text-background/70">
              Yeni ürünler, özel teklifler ve stil ilhamı için bültenimize abone olun.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-bold">{data.storeName}</span>
            </Link>
            {data.description ? (
              <p className="mt-4 text-sm text-background/70 leading-relaxed">{data.description}</p>
            ) : null}
            {socials.length > 0 ? (
              <div className="mt-6 flex gap-4">
                {socials.map(([name, url]) => {
                  const Icon = SOCIAL_ICONS[name];
                  if (!Icon) return null;
                  return (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-background/70 transition-colors hover:text-background"
                      aria-label={name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Alışveriş (collections) */}
          {data.collections.length > 0 ? (
            <div>
              <h4 className="font-semibold">Alışveriş</h4>
              <ul className="mt-4 space-y-2">
                {data.collections.slice(0, 6).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/search/${c.slug}`} className="text-sm text-background/70 transition-colors hover:text-background">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Manifest footer columns */}
          {data.columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={`${l.label}-${l.url}`}>
                    <Link href={l.url} className="text-sm text-background/70 transition-colors hover:text-background">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* İletişim */}
          {data.email || data.phone || data.address ? (
            <div>
              <h4 className="font-semibold">İletişim</h4>
              <ul className="mt-4 space-y-2 text-sm text-background/70">
                {data.email ? (
                  <li>
                    <a href={`mailto:${data.email}`} className="hover:text-background">{data.email}</a>
                  </li>
                ) : null}
                {data.phone ? (
                  <li>
                    <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="hover:text-background">{data.phone}</a>
                  </li>
                ) : null}
                {data.address ? <li className="pt-1 leading-relaxed">{data.address}</li> : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-background/70 md:flex-row">
            <p>&copy; {year} {data.storeName}. Tüm hakları saklıdır.</p>
            <div className="flex gap-6">
              <Link href="/content/privacy" className="hover:text-background">Gizlilik Politikası</Link>
              <Link href="/content/terms" className="hover:text-background">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
