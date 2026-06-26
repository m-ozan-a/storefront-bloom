import { Skeleton } from '@/components/ui/skeleton';

// Wrapper spec'i null/yüklenmemişse yerini tutan iskelet. Sıralı render edildiğinde
// sayfanın orta kısmı boş kalmaz, layout zıplamaz.
export function WrapperSkeleton({ kind }: { kind: string }) {
  switch (kind) {
    case 'hero':
      return (
        <section className="container mx-auto px-4 py-20">
          <Skeleton className="mx-auto h-[40vh] min-h-[280px] w-full rounded-xl" />
        </section>
      );
    case 'category-banners':
      return (
        <section className="container mx-auto grid grid-cols-2 gap-4 px-4 py-16 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
          ))}
        </section>
      );
    case 'product-showcase':
      return (
        <section className="container mx-auto px-4 py-16">
          <Skeleton className="mb-8 h-8 w-48" />
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
      );
    case 'trust-badges':
      return (
        <section className="container mx-auto grid grid-cols-2 gap-4 px-4 py-12 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </section>
      );
    case 'newsletter':
      return (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Skeleton className="mx-auto h-48 max-w-2xl rounded-xl" />
          </div>
        </section>
      );
    default:
      return (
        <section className="container mx-auto px-4 py-12">
          <Skeleton className="h-40 w-full rounded-lg" />
        </section>
      );
  }
}
