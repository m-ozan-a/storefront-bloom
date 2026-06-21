import { getProducts, getManifest } from "@/lib/owuan";
import type { CategoryGridItem } from "@/components/sections/category-grid";
import type { Product } from "@/lib/owuan/types";

interface FlatSpecElement {
  type?: string;
  props?: Record<string, unknown>;
  children?: string[];
}

export interface FlatSpec {
  root: string;
  elements: Record<string, FlatSpecElement>;
}

export function isFlatSpec(spec: unknown): spec is FlatSpec {
  const s = spec as Record<string, unknown>;
  return !!s && typeof s.root === "string" && typeof s.elements === "object" && s.elements !== null;
}

export async function buildSpecState(spec: FlatSpec): Promise<Record<string, unknown>> {
  const state: Record<string, unknown> = {};
  const elements = Object.values(spec.elements);

  const carousels = elements.filter((el) => el.type === "ProductCarousel");
  if (carousels.length > 0) {
    await Promise.all(
      carousels.map(async (el) => {
        const collection = el.props?.collection as string | undefined;
        const tag = el.props?.tag as string | undefined;
        const key = collection || tag || "default";
        if (state[`/products/${key}`]) return;
        try {
          state[`/products/${key}`] = await getProducts({ collection, limit: 12 });
        } catch {
          state[`/products/${key}`] = [] as Product[];
        }
      })
    );
  }

  if (elements.some((el) => el.type === "CategoryGrid")) {
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
