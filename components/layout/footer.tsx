"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { getCollections } from "@/lib/owuan";
import { footerMenu } from "@/lib/owuan/dummy-data";
import type { Collection } from "@/lib/owuan/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => setCollections([]));
  }, []);
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-serif font-bold">
              Join the Owuan World
            </h3>
            <p className="mt-2 text-sm text-background/70">
              Subscribe to receive updates on new arrivals, exclusive offers, and styling inspiration.
            </p>
            <form className="mt-6 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-background"
              />
              <Button variant="secondary" className="px-6">
                Subscribe
              </Button>
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
              <span className="text-2xl font-serif font-bold">OWUAN</span>
            </Link>
            <p className="mt-4 text-sm text-background/70 leading-relaxed">
              Modern elegance for the contemporary woman. Timeless pieces crafted with care and attention to detail.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="text-background/70 transition-colors hover:text-background"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-background/70 transition-colors hover:text-background"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-background/70 transition-colors hover:text-background"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-background/70 transition-colors hover:text-background"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2">
              {collections.slice(0, 6).map((collection) => (
                <li key={collection.handle}>
                  <Link
                    href={collection.path}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold">Help</h4>
            <ul className="mt-4 space-y-2">
              {footerMenu.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              <li>
                <a href="mailto:hello@owuan.com" className="hover:text-background">
                  hello@owuan.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-background">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="pt-2">
                <p>123 Fashion Avenue</p>
                <p>New York, NY 10001</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-background/70 md:flex-row">
            <p>&copy; {new Date().getFullYear()} Owuan. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-background">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-background">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
