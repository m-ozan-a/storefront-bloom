import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-serif font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        Sayfa Bulunamadı
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ana Sayfaya Dön
      </Link>
    </main>
  );
}
