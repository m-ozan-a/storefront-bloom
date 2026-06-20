"use client";

import { shadcnComponents } from "@json-render/shadcn";
import { defineRegistry, useStateValue } from "@json-render/react";
import { catalog } from "./catalog";
import { HeroCentered } from "@/components/sections/hero/variants/centered";
import { HeroSplitLeft } from "@/components/sections/hero/variants/split-left";
import { HeroSplitRight } from "@/components/sections/hero/variants/split-right";
import { HeroFullscreenVideo } from "@/components/sections/hero/variants/fullscreen-video";
import { HeroMinimalText } from "@/components/sections/hero/variants/minimal-text";
import { BannerCardOverlay } from "@/components/sections/banner/variants/card-overlay";
import { BannerTextBelow } from "@/components/sections/banner/variants/text-below";
import { CarouselFullWidth } from "@/components/sections/carousel/variants/full-width";
import { CarouselThumbnailNav } from "@/components/sections/carousel/variants/thumbnail-nav";
import { ProductCarouselSection } from "@/components/product/product-carousel-section";
import type { Product } from "@/lib/owuan/types";

// Tek kaynak component map — daha önce registry.tsx ve storefront-renderer.tsx
// içinde ~%90 kopya halinde duruyordu. Yeni component eklerken sadece burayı ve
// catalog.ts'i güncelle (owuan tarafı için: mastra/storefront/component-catalog.ts).

const HERO_VARIANTS = {
  centered: HeroCentered,
  "split-left": HeroSplitLeft,
  "split-right": HeroSplitRight,
  "fullscreen-video": HeroFullscreenVideo,
  "minimal-text": HeroMinimalText,
} as const;

const BANNER_VARIANTS = {
  "card-overlay": BannerCardOverlay,
  "text-below": BannerTextBelow,
} as const;

const CAROUSEL_VARIANTS = {
  "full-width": CarouselFullWidth,
  "thumbnail-nav": CarouselThumbnailNav,
} as const;

function ProductCarouselComponent({ props }: {
  props: {
    title: string;
    collection: string | null;
    tag: string | null;
    maxItems: number | null;
  };
}) {
  const key = props.collection || props.tag || "default";
  const products = useStateValue<Product[]>(`/products/${key}`) ?? [];
  if (products.length === 0) return null;
  return (
    <ProductCarouselSection
      carousels={[{
        title: props.title,
        collection: props.collection ?? undefined,
        tag: props.tag ?? undefined,
        maxItems: props.maxItems ?? 8,
        products,
      }]}
    />
  );
}

export const { registry } = defineRegistry(catalog, {
  components: {
  Stack: shadcnComponents.Stack,
  Grid: shadcnComponents.Grid,
  Heading: shadcnComponents.Heading,
  Text: shadcnComponents.Text,
  Image: shadcnComponents.Image,
  Badge: shadcnComponents.Badge,
  Button: shadcnComponents.Button,
  Separator: shadcnComponents.Separator,

  Hero: ({ props }) => {
    const variant = props.variant ?? "centered";
    const Component = HERO_VARIANTS[variant as keyof typeof HERO_VARIANTS] ?? HeroCentered;
    return (
      <Component
        data={{
          heading: props.heading,
          subheading: props.subheading ?? undefined,
          ctaText: props.ctaText ?? undefined,
          ctaUrl: props.ctaUrl ?? undefined,
          imageUrl: props.imageUrl ?? undefined,
          videoUrl: props.videoUrl ?? undefined,
          variant: props.variant ?? undefined,
        }}
      />
    );
  },

  Banner: ({ props }) => {
    const variant = props.variant ?? "card-overlay";
    const Component = BANNER_VARIANTS[variant as keyof typeof BANNER_VARIANTS] ?? BannerCardOverlay;
    return (
      <Component
        data={{
          title: props.title,
          description: props.description ?? undefined,
          imageUrl: props.imageUrl,
          linkUrl: props.linkUrl,
          variant: props.variant ?? undefined,
        }}
      />
    );
  },

  BannerGroup: ({ props, children }) => {
    const cols = props.columns ?? "3";
    const colClass: Record<string, string> = {
      "1": "grid-cols-1",
      "2": "grid-cols-1 sm:grid-cols-2",
      "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    };
    return (
      <section className="container mx-auto px-4 py-16">
        <div className={`grid gap-4 ${colClass[cols] ?? colClass["3"]}`}>
          {children}
        </div>
      </section>
    );
  },

  Carousel: ({ props }) => {
    const variant = props.variant ?? "full-width";
    const Component = CAROUSEL_VARIANTS[variant as keyof typeof CAROUSEL_VARIANTS] ?? CarouselFullWidth;
    return (
      <section className="container mx-auto px-4 py-16">
        <Component
          data={{
            title: props.title ?? undefined,
            images: props.images.map((img) => ({
              url: img.url,
              alt: img.alt ?? undefined,
              linkUrl: img.linkUrl ?? undefined,
            })),
            variant: props.variant ?? undefined,
          }}
        />
      </section>
    );
  },

  ProductCarousel: ({ props }) => <ProductCarouselComponent props={props} />,
  },
});
