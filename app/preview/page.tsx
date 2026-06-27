import { getManifest } from "@/actions";
import type { Spec } from "@json-render/core";
import { isFlatSpec, buildSpecState } from "@/lib/json-render/build-spec-state";
import { PreviewRenderer } from "./renderer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const SLOT_SPEC_KEY = {
  header: "headerSpec",
  footer: "footerSpec",
  productPage: "productPageSpec",
  listing: "listingSpec",
} as const;

type Slot = keyof typeof SLOT_SPEC_KEY;

const SLOT_LABEL: Record<Slot, string> = {
  header: "Üst menü (header)",
  footer: "Alt bilgi (footer)",
  productPage: "Ürün detay sayfası",
  listing: "Ürün listeleme sayfası",
};

const SLOT_HINT: Record<Slot, string> = {
  header: "Bu bölge her sayfada üst menünün hemen altında görünür.",
  footer: "Bu bölge her sayfada alt bilginin hemen üstünde görünür.",
  productPage: "Bu bölge ürün detay sayfasında, ürün bilgilerinin altında görünür.",
  listing: "Bu bölge ürün listeleme sayfasında, başlığın altında görünür.",
};

function isSlot(value: string | undefined): value is Slot {
  return value === "header" || value === "footer" || value === "productPage" || value === "listing";
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string }>;
}) {
  const { slot: slotParam } = await searchParams;
  const slot = isSlot(slotParam) ? slotParam : null;

  let spec: unknown = null;

  try {
    const manifest = await getManifest();
    spec = slot
      ? (manifest.activeTheme?.[SLOT_SPEC_KEY[slot]] ?? null)
      : (manifest.activeTheme?.spec ?? null);
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-muted-foreground text-sm">
        Önizleme yüklenemedi. Owuan API bağlantısını kontrol edin.
      </main>
    );
  }

  if (!spec || !isFlatSpec(spec)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-foreground">Henüz bir tasarım yok</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {slot
              ? `Tema asistanı ile ${SLOT_LABEL[slot]} düzenlemesi yaptığınızda burada görünecek.`
              : "Tema asistanı ile ana sayfa düzenlemesi yaptığınızda burada görünecek."}
          </p>
        </div>
      </main>
    );
  }

  const initialState = await buildSpecState(spec);

  if (slot) {
    return (
      <main>
        <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{SLOT_LABEL[slot]}</span> önizlemesi —{" "}
          {SLOT_HINT[slot]}
        </div>
        <PreviewRenderer spec={spec as unknown as Spec} initialState={initialState} />
      </main>
    );
  }

  return (
    <main>
      <PreviewRenderer spec={spec as unknown as Spec} initialState={initialState} />
    </main>
  );
}
