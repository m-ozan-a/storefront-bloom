import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 pt-32 pb-16 text-center">
      <PackageX className="h-16 w-16 text-muted-foreground/40" />
      <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Ürün bulunamadı</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Aradığınız ürün kaldırılmış veya artık mevcut değil. Diğer ürünlerimize göz atabilirsiniz.
      </p>
      <Button asChild className="mt-6">
        <Link href="/search">Tüm Ürünler</Link>
      </Button>
    </main>
  );
}
