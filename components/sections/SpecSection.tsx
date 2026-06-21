import { PageRenderer } from "@json-render/next";
import { getProducts, getManifest } from "@/lib/owuan";
import type { CategoryGridItem } from "@/components/sections/category-grid";
import type { Spec } from "@json-render/core";

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
  return s && typeof s.root === "string" && typeof s.elements === "object" && s.elements !== null;
}

function collectProductCarouselsFlat(elements: Record<string, FlatSpecElement>): { collection?: string; tag?: string }[] {
  const result: { collection?: string; tag?: string }[] = [];
  for (const el of Object.values(elements)) {
    if (el.type === "ProductCarousel") {
      result.push({
        collection: el.props?.collection as string | undefined,
        tag: el.props?.tag as string | undefined,
      });
    }
  }
  return result;
}

function hasTypeFlat(elements: Record<string, FlatSpecElement>, type: string): boolean {
  return Object.values(elements).some((el) => el.type === type);
}

export async function SpecSection({ spec }: { spec: unknown }) {
  if (!spec || !isFlatSpec(spec)) return null;

  const carousels = collectProductCarouselsFlat(spec.elements);
  const productState: Record<string, unknown[]> = {};

  if (carousels.length > 0) {
    await Promise.all(
      carousels.map(async ({ collection, tag }) => {
        const key = collection || tag || "default";
        if (productState[key]) return;
        try {
          productState[key] = await getProducts({ collection, limit: 12 });
        } catch {
          productState[key] = [];
        }
      })
    );
  }

  const initialState: Record<string, unknown> = {};
  for (const [key, products] of Object.entries(productState)) {
    initialState[`/products/${key}`] = products;
  }

  if (hasTypeFlat(spec.elements, "CategoryGrid")) {
    try {
      const manifest = await getManifest();
      initialState["/categories"] = manifest.categories
        .filter((c) => c.isActive)
        .map<CategoryGridItem>((c) => ({ title: c.title, slug: c.slug, image: c.image ?? null }));
    } catch {
      initialState["/categories"] = [];
    }
  }

  return (
    <PageRenderer
      spec={spec as unknown as Spec}
      initialState={initialState}
    />
  );
}
