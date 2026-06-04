import Link from 'next/link';
import { collections } from '@/lib/owuan/dummy-data';
import { cn } from '@/lib/utils';

interface CollectionSidebarProps {
  currentCollection?: string;
}

export function CollectionSidebar({ currentCollection }: CollectionSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-56">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
        Collections
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
              All Products
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
      </nav>
    </aside>
  );
}
