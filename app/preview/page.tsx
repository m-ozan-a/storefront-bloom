import { getManifest, getProducts } from "@/lib/owuan";
import type { CategoryGridItem } from "@/components/sections/category-grid";
import type { Spec } from "@json-render/core";
import { PreviewRenderer } from "./renderer";
import type { Product } from "@/lib/owuan/types";

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

interface FlatSpecElement {
  type?: string;
  props?: Record<string, unknown>;
  children?: string[];
}

interface FlatSpec {
  root: string;
  elements: Record<string, FlatSpecElement>;
}

function isFlatSpec(spec: unknown): spec is FlatSpec {
  const s = spec as Record<string, unknown>;
  return !!s && typeof s.root === "string" && typeof s.elements === "object" && s.elements !== null;
}

async function buildInitialState(spec: FlatSpec): Promise<Record<string, unknown>> {
  const state: Record<string, unknown> = {};
  const elements = Object.values(spec.elements);

  // ProductCarousel → /products/{collection|tag|default}
  const carousels = elements.filter((el) => el.type === "ProductCarousel");
  if (carousels.length > 0) {
    await Promise.all(
      carousels.map(async (el) => {
        const collection = el.props?.collection as string | undefined;
        const tag = el.props?.tag as string | undefined;
        const key = collection || tag || "default";
        if (state[`/products/${key}`]) return;
        try {
          const products = await getProducts({ collection, limit: 12 });
          state[`/products/${key}`] = products;
        } catch {
          state[`/products/${key}`] = [] as Product[];
        }
      })
    );
  }

  // CategoryGrid → /categories
  const hasCategoryGrid = elements.some((el) => el.type === "CategoryGrid");
  if (hasCategoryGrid) {
    try {
      const manifest = await getManifest();
      state["/categories"] = manifest.categories
        .filter((c) => c.isActive)
        .map<CategoryGridItem>((c) => ({ title: c.title, slug: c.slug, image: c.image ?? null }));
    } catch {
      state["/categories"] = [] as CategoryGridItem[];
    }
  }

  return state;
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

  const initialState = await buildInitialState(spec);

  if (slot) {
    return (
      <main>
        <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{SLOT_LABEL[slot]}</span> önizlemesi — {SLOT_HINT[slot]}
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
