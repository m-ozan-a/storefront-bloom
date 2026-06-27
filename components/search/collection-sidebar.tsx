import Link from 'next/link';
import { getStorefrontManifest } from '@/actions';
import { cn } from '@/lib/utils';

interface CollectionSidebarProps {
  currentCollection?: string;
}

export async function CollectionSidebar({ currentCollection }: CollectionSidebarProps) {
  const manifest = await getStorefrontManifest();
  const collections = (manifest?.collections ?? [])
    .filter((c) => c.isActive !== false)
    .map((c) => ({ handle: c.slug, title: c.title, path: `/search/${c.slug}` }));

  return (
    <aside className="hidden lg:block lg:w-56">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
        Koleksiyonlar
      </h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/search"
              className={cn(
                'block py-1 text-sm transition-colors hover:text-foreground',
                !currentCollection
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              Tüm Ürünler
            </Link>
          </li>
          {collections.map((collection) => (
            <li key={collection.handle}>
              <Link
                href={collection.path}
                className={cn(
                  'block py-1 text-sm transition-colors hover:text-foreground',
                  currentCollection === collection.handle
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {collection.title}
              </Link>
            </li>
          ))}
        </ul>
        {collections.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Henüz koleksiyon eklenmemiş.</p>
        ) : null}
      </nav>
    </aside>
  );
}
