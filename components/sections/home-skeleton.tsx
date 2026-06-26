import { Skeleton } from '@/components/ui/skeleton';

export function HomeSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Campaign banners */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="container mx-auto px-4 py-4">
        <Skeleton className="aspect-[16/7] w-full rounded-xl" />
      </section>

      {/* Product carousel */}
      <section className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
