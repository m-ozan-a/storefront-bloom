"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu as MenuIcon, X, ChevronDown } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/owuan/stores";
import { cn } from "@/lib/utils";
import type { HeaderData, NavLink } from "@/actions";

const NAV_BASE = "text-sm font-medium px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-muted";

function DesktopNavItem({ item, pathname }: { item: NavLink; pathname: string }) {
  const active = pathname === item.url;
  const cls = cn(NAV_BASE, active ? "text-foreground bg-muted" : "text-muted-foreground");
  if (!item.children || item.children.length === 0) {
    return <Link href={item.url} className={cls}>{item.label}</Link>;
  }
  return (
    <div className="relative group">
      <span className={cn(cls, "flex cursor-default items-center gap-1")}>
        {item.label}
        <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
      </span>
      <div className="invisible absolute left-0 top-full z-50 pt-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="min-w-[200px] rounded-lg border bg-card p-2 shadow-lg">
          {item.children.map((c) => (
            <Link
              key={`${c.label}-${c.url}`}
              href={c.url}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header({ data }: { data: HeaderData }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  const { cart, openCart, fetchCart } = useCartStore();
  const { items: wishlistItems, openWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) fetchCart();
  }, [mounted, fetchCart]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const links = data.links;

  return (
    <>
      <div
        className={cn(
          "fixed top-0 inset-x-0 z-50 bg-background isolate transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {data.announcement ? (
          <div className="bg-foreground py-2 text-center text-sm text-background border-b border-border">
            <p>{data.announcement}</p>
          </div>
        ) : (
          <div className="bg-foreground py-2 text-center text-sm text-background border-b border-border">
            <p>Free shipping available on all orders</p>
          </div>
        )}

        <header className="relative h-20 mx-auto border-b border-border">
          <nav className="content-container flex items-center justify-between w-full h-full">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-x-12 h-full">
              <Link
                href="/"
                className="text-xl font-[family-name:var(--font-serif)] font-semibold hover:text-muted-foreground uppercase tracking-tight transition-colors"
              >
                {data.storeName || "Essentials"}
              </Link>

              <div className="hidden lg:flex items-center gap-8 h-full">
                {links.filter((l) => l.children && l.children.length > 0).map((item) => (
                  <DesktopNavItem key={`${item.label}-${item.url}`} item={item} pathname={pathname} />
                ))}
                {links.filter((l) => !l.children || l.children.length === 0).map((item) => (
                  <DesktopNavItem key={`${item.label}-${item.url}`} item={item} pathname={pathname} />
                ))}
              </div>
            </div>

            {/* Right: Utility Icons */}
            <div className="flex items-center gap-x-2 h-full">
              {data.showSearch !== false ? (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              ) : null}

              {data.showAccount !== false ? (
                <Link
                  href="/account"
                  className="hidden sm:flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : null}

              {data.showWishlist !== false ? (
                <button
                  onClick={openWishlist}
                  className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {mounted && wishlistItems.length > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                      {wishlistItems.length}
                    </span>
                  ) : null}
                </button>
              ) : null}

              {data.showCart !== false ? (
                <button
                  onClick={openCart}
                  className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {mounted && cart.totalQuantity > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                      {cart.totalQuantity}
                    </span>
                  ) : null}
                </button>
              ) : null}

              <button
                className="lg:hidden flex h-10 w-10 items-center justify-center text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </nav>
        </header>

        {/* Search Bar */}
        {isSearchOpen ? (
          <div className="border-t border-border px-5 py-4 bg-background">
            <div className="content-container">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-secondary px-4 py-3 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </form>
            </div>
          </div>
        ) : null}

        {/* Mobile Menu */}
        {isMobileMenuOpen ? (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="w-full px-5 py-4">
              <ul className="space-y-4">
                {links.map((item) => (
                  <li key={`${item.label}-${item.url}`}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <span className="block py-2 text-lg font-medium text-foreground">{item.label}</span>
                        <ul className="ml-3 space-y-2 border-l border-border pl-3">
                          {item.children.map((c) => (
                            <li key={`${c.label}-${c.url}`}>
                              <Link
                                href={c.url}
                                className={cn(
                                  "block py-1 text-base font-medium transition-colors",
                                  pathname === c.url ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={item.url}
                        className={cn(
                          "block py-2 text-lg font-medium transition-colors",
                          pathname === item.url ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-4 mt-4">
                <Link
                  href="/account"
                  className="flex items-center gap-2 py-2 text-lg font-medium text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  Account
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[88px]" />
    </>
  );
}
