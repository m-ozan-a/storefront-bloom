'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu as MenuIcon, X, ChevronRight } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/owuan/stores';
import { getMenu, getNavTree } from '@/lib/owuan';
import type { Menu, NavItem } from '@/lib/owuan/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function DesktopNavItem({
  item,
  pathname,
  resolvePath,
}: {
  item: NavItem;
  pathname: string;
  resolvePath: (item: NavItem) => string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const path = resolvePath(item);
  const isActive = pathname === path;

  if (!hasChildren) {
    return (
      <Link
        href={path}
        className={cn(
          'text-sm font-medium px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-muted',
          isActive ? 'text-foreground bg-muted' : 'text-muted-foreground'
        )}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={path}
        className={cn(
          'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-muted',
          isActive ? 'text-foreground bg-muted' : 'text-muted-foreground'
        )}
      >
        {item.title}
        <ChevronRight className="size-3 rotate-90 transition-transform group-hover:-rotate-90" />
      </Link>
      <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="bg-card border rounded-lg shadow-lg p-4 min-w-[220px]">
          {item.image && (
            <div className="mb-3 rounded-md overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
            </div>
          )}
          <div className="space-y-1">
            {item.children!.map((child) => {
              const childPath = resolvePath(child);
              return (
                <Link
                  key={child.title}
                  href={childPath}
                  className={cn(
                    'block text-sm px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-muted',
                    pathname === childPath ? 'text-foreground bg-muted' : 'text-muted-foreground'
                  )}
                >
                  {child.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavTree({
  items,
  pathname,
  resolvePath,
  depth = 0,
}: {
  items: NavItem[];
  pathname: string;
  resolvePath: (item: NavItem) => string;
  depth?: number;
}) {
  return (
    <ul className={cn('space-y-1', depth > 0 && 'pl-4 border-l border-border ml-2')}>
      {items.map((item) => {
        const path = resolvePath(item);
        const hasChildren = item.children && item.children.length > 0;
        return (
          <li key={item.title}>
            <Link
              href={path}
              className={cn(
                'block py-2 font-medium transition-colors',
                depth === 0 ? 'text-lg' : 'text-sm',
                pathname === path ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.title}
            </Link>
            {hasChildren && (
              <MobileNavTree
                items={item.children!}
                pathname={pathname}
                resolvePath={resolvePath}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const { cart, openCart, fetchCart } = useCartStore();
  const { items: wishlistItems, openWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [navTree, setNavTree] = useState<NavItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCart();
    }
  }, [mounted, fetchCart]);

  useEffect(() => {
    getMenu("header").then(setMenuItems).catch(() => {});
    getNavTree("header").then(setNavTree).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const resolveNavPath = (item: NavItem): string => {
    if (item.path) return item.path;
    if (item.slug) {
      switch (item.type) {
        case "brand": return `/search?brand=${item.slug}`;
        case "category":
        case "collection":
        default: return `/search/${item.slug}`;
      }
    }
    return "#";
  };

  // Desktop Navigation
  const hasTreeNav = navTree.length > 0;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || isMobileMenuOpen
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-background'
      )}
    >
      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-center text-xs py-2 px-4">
        1500 TL üzeri ücretsiz kargo | Her hafta yeni ürünler
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold tracking-tight text-foreground">
              OWUAN
            </span>
          </Link>

          {/* Desktop Navigation — Mega Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {hasTreeNav
              ? navTree.map((item) => <DesktopNavItem key={item.title} item={item} pathname={pathname} resolvePath={resolveNavPath} />)
              : menuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'text-sm font-medium px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-muted',
                      pathname === item.path
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/account"
              className="hidden sm:flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={openWishlist}
              className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cart.totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                  {cart.totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-border py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full bg-secondary px-4 py-3 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4">
            {hasTreeNav ? (
              <MobileNavTree items={navTree} pathname={pathname} resolvePath={resolveNavPath} />
            ) : (
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        'block py-2 text-lg font-medium transition-colors',
                        pathname === item.path
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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
      )}
    </header>
  );
}
