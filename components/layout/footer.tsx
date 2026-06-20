"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Instagram, Facebook, Youtube, Loader2, Check, AlertCircle } from "lucide-react";
import { getCollections, getManifest, getNavTree, subscribeToNewsletter } from "@/lib/owuan";
import type { Collection, NavItem } from "@/lib/owuan/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
};

type StoreInfo = {
  name: string;
  description: string | null;
  email: string;
  phone: string;
  address: string;
};

export function Footer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [footerNav, setFooterNav] = useState<NavItem[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    getCollections().then(setCollections).catch(() => setCollections([]));
    getNavTree("footer").then(setFooterNav).catch(() => setFooterNav([]));
    getManifest().then((m) => {
      setSocialLinks({
        instagram: m.store.socialInstagram ?? undefined,
        facebook: m.store.socialFacebook ?? undefined,
        tiktok: m.store.socialTiktok ?? undefined,
        youtube: m.store.socialYoutube ?? undefined,
        linkedin: m.store.socialLinkedin ?? undefined,
      });
      setStoreInfo({
        name: m.store.name,
        description: m.store.description,
        email: m.store.email,
        phone: m.store.phone,
        address: m.store.address,
      });
    }).catch(() => {});
  }, []);

  async function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || newsletterStatus === "loading") return;
    setNewsletterStatus("loading");
    setNewsletterMessage("");
    try {
      await subscribeToNewsletter(email);
      setNewsletterStatus("success");
      setNewsletterMessage("Abone olduğunuz için teşekkürler!");
      setEmail("");
    } catch (err) {
      setNewsletterStatus("error");
      setNewsletterMessage(err instanceof Error ? err.message : "Bir hata oluştu, lütfen tekrar deneyin.");
    }
  }

  const storeName = storeInfo?.name ?? "";

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-serif font-bold">
              {storeName ? `${storeName} dünyasına katılın` : "Bültenimize abone olun"}
            </h3>
            <p className="mt-2 text-sm text-background/70">
              Yeni ürünler, özel teklifler ve stil ilhamı için bültenimize abone olun.
            </p>
            <form className="mt-6 flex flex-col gap-3" onSubmit={handleNewsletterSubmit}>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-background"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="px-6"
                  disabled={newsletterStatus === "loading" || newsletterStatus === "success" || !email}
                >
                  {newsletterStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Abone Ol"}
                </Button>
              </div>
              {newsletterStatus === "success" && (
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {newsletterMessage}
                </p>
              )}
              {newsletterStatus === "error" && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-bold">{storeName || "Mağaza"}</span>
            </Link>
            {storeInfo?.description && (
              <p className="mt-4 text-sm text-background/70 leading-relaxed">
                {storeInfo.description}
              </p>
            )}
            <div className="mt-6 flex gap-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-background/70 transition-colors hover:text-background" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-background/70 transition-colors hover:text-background" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-background/70 transition-colors hover:text-background" aria-label="TikTok">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-background/70 transition-colors hover:text-background" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-background/70 transition-colors hover:text-background" aria-label="LinkedIn">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold">Alışveriş</h4>
            <ul className="mt-4 space-y-2">
              {collections.slice(0, 6).map((collection) => (
                <li key={collection.handle}>
                  <Link href={collection.path} className="text-sm text-background/70 transition-colors hover:text-background">
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help / Footer Nav */}
          {footerNav.length > 0 ? (
            <div>
              <h4 className="font-semibold">Yardım</h4>
              <ul className="mt-4 space-y-2">
                {footerNav.map((item) => {
                  const href = item.path ?? (item.slug ? `/${item.slug}` : "#");
                  return (
                    <li key={item.title}>
                      <Link href={href} className="text-sm text-background/70 transition-colors hover:text-background">
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold">Yardım</h4>
              <ul className="mt-4 space-y-2">
                {[
                  { title: "Hakkımızda", path: "/about" },
                  { title: "İletişim", path: "/contact" },
                  { title: "Sık Sorulan Sorular", path: "/faq" },
                  { title: "Gizlilik Politikası", path: "/privacy" },
                  { title: "Kullanım Koşulları", path: "/terms" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} className="text-sm text-background/70 transition-colors hover:text-background">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {storeInfo && (storeInfo.email || storeInfo.phone || storeInfo.address) && (
            <div>
              <h4 className="font-semibold">İletişim</h4>
              <ul className="mt-4 space-y-2 text-sm text-background/70">
                {storeInfo.email && (
                  <li>
                    <a href={`mailto:${storeInfo.email}`} className="hover:text-background">
                      {storeInfo.email}
                    </a>
                  </li>
                )}
                {storeInfo.phone && (
                  <li>
                    <a href={`tel:${storeInfo.phone.replace(/\s/g, "")}`} className="hover:text-background">
                      {storeInfo.phone}
                    </a>
                  </li>
                )}
                {storeInfo.address && (
                  <li className="pt-1 leading-relaxed">
                    {storeInfo.address}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-background/70 md:flex-row">
            <p>&copy; {new Date().getFullYear()} {storeName || "Mağaza"}. Tüm hakları saklıdır.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-background">Gizlilik Politikası</Link>
              <Link href="/terms" className="hover:text-background">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
