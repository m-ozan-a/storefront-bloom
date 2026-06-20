import { getManifest } from "@/lib/owuan";
import { SpecSection } from "@/components/sections/SpecSection";
import { getProducts } from "@/lib/owuan";
import { ProductCarouselSection } from "@/components/product/product-carousel-section";

// No caching — always show latest spec
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  let homepageSpec: unknown = null;

  try {
    const manifest = await getManifest();
    homepageSpec = manifest.activeTheme?.spec ?? null;
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-muted-foreground text-sm">
        Önizleme yüklenemedi. Owuan API bağlantısını kontrol edin.
      </main>
    );
  }

  if (!homepageSpec) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-foreground">Henüz bir tasarım yok</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tema asistanı ile ana sayfa düzenlemesi yaptığınızda burada görünecek.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <SpecSection spec={homepageSpec} />
    </main>
  );
}
