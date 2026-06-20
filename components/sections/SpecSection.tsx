import { StorefrontRenderer } from "@/lib/json-render/storefront-renderer";
import { getProducts } from "@/lib/owuan";
import type { Product } from "@/lib/owuan/types";
import type { Spec } from "@json-render/core";

interface FlatSpecElement {
  type?: string;
  props?: Record<string, unknown>;
  children?: string[]; // flat format: string keys
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

export async function SpecSection({ spec }: { spec: unknown }) {
  if (!spec) return null;

  // Only flat spec format is supported: { root: "string-key", elements: { key: { type, props, children: string[] } } }
  if (!isFlatSpec(spec)) return null;

  // Pre-fetch products for all ProductCarousel elements
  const carousels = collectProductCarouselsFlat(spec.elements);
  const productState: Record<string, Product[]> = {};

  if (carousels.length > 0) {
    await Promise.all(
      carousels.map(async ({ collection, tag }) => {
        const key = collection || tag || "default";
        if (productState[key]) return;
        try {
          const products = await getProducts({ collection, limit: 12 });
          productState[key] = products;
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

  return (
    <StorefrontRenderer
      spec={spec as unknown as Spec}
      state={initialState}
    />
  );
}
