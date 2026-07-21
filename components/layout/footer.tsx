import Link from "next/link";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import type { FooterData } from "@/actions";

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: TiktokIcon,
  twitter: TwitterXIcon,
  x: TwitterXIcon,
};

const PAYMENT_ICONS = [
  { src: "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/visa-01KGM4VCEN4S70B20CHKYRKYHD.svg", alt: "Visa" },
  { src: "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/mastercard-01KGM4VC6Q7D8S2A8GGBZZ9WH2.svg", alt: "Mastercard" },
  { src: "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/paypal-01KGM4VBX940SCWM1DAE1SPAQH.svg", alt: "PayPal" },
  { src: "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/klarna-01KGM4VBN2SGCV6FSX1MBC5GQJ.svg", alt: "Klarna" },
];

export function Footer({ data, logoText }: { data: FooterData; logoText?: string }) {
  const year = new Date().getFullYear();
  const brandName = logoText ?? data.storeName;
  const socials = Object.entries(data.social).filter(([, url]) => !!url) as [string, string][];

  return (
    <footer className="bg-neutral-900 text-neutral-50 w-full">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-y-6">
            <Link
              href="/"
              className="text-2xl font-[family-name:var(--font-serif)] font-semibold hover:text-neutral-300 transition-colors w-fit uppercase tracking-tight"
            >
              {brandName}
            </Link>
            {data.description ? (
              <p className="text-neutral-400 max-w-sm text-sm leading-relaxed">
                {data.description}
              </p>
            ) : (
              <p className="text-neutral-400 max-w-sm text-sm leading-relaxed">
                Premium athleisure designed for movement. Thoughtfully crafted essentials
                that move seamlessly from studio to street.
              </p>
            )}
            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs text-neutral-400 mb-3 uppercase tracking-wide">
                Newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Shop Column */}
          {data.collections.length > 0 ? (
            <div className="flex flex-col gap-y-6">
              <h3 className="text-neutral-50 text-xs font-semibold uppercase tracking-wider">
                Shop
              </h3>
              <ul className="space-y-3">
                {data.collections.slice(0, 6).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/search/${c.slug}`}
                      className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* About Column */}
          <div className="flex flex-col gap-y-6">
            <h3 className="text-neutral-50 text-xs font-semibold uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/content/about" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/content/faq" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/content/payments" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  Payments
                </Link>
              </li>
              <li>
                <Link href="/content/shipping" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/content/returns" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/content/contact" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Contact Column */}
          <div className="flex flex-col gap-y-6">
            <h3 className="text-neutral-50 text-xs font-semibold uppercase tracking-wider">
              Support
            </h3>
            {data.email ? (
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">
                  Customer Care
                </p>
                <a href={`mailto:${data.email}`} className="text-sm text-neutral-300 mt-2 hover:text-neutral-100 transition-colors">
                  {data.email}
                </a>
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">
                  Customer Care
                </p>
                <p className="text-sm text-neutral-300 mt-2">
                  hello@essentials.com
                </p>
              </div>
            )}
            {data.phone ? (
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">
                  Phone
                </p>
                <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="text-sm text-neutral-300 mt-2 hover:text-neutral-100 transition-colors">
                  {data.phone}
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-xs text-neutral-500">
                &copy; {year} {brandName}. All rights reserved.
              </span>

              {/* Social Icons */}
              {socials.length > 0 ? (
                <div className="flex items-center gap-5">
                  {socials.map(([name, url]) => {
                    const Icon = SOCIAL_ICONS[name];
                    if (!Icon) return null;
                    return (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-neutral-300 transition-colors"
                        aria-label={name}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              ) : null}

              {/* Payment Methods */}
              <div className="flex items-center gap-3" suppressHydrationWarning>
                {PAYMENT_ICONS.map((payment) => (
                  <img
                    key={payment.alt}
                    src={payment.src}
                    alt={payment.alt}
                    className="h-7 w-auto object-contain"
                    suppressHydrationWarning
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-xs">
              <Link
                href="/content/privacy"
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/content/terms"
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
