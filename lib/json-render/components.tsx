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
import { CountdownSection } from "@/components/sections/countdown";
import { CategoryGridSection, type CategoryGridItem } from "@/components/sections/category-grid";
import { NewsletterSignupSection } from "@/components/sections/newsletter-signup";
import type { Product } from "@/lib/owuan/types";

// Tek kaynak component map. Yeni component eklerken sadece burayı ve
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

const SPACER_SIZES: Record<string, string> = {
  sm: "h-4",
  md: "h-8",
  lg: "h-16",
  xl: "h-24",
};

// YouTube/Vimeo izleme linkini gömme (embed) URL'ine çevirir. Codegen tarafıyla
// (owuan/mastra/tools/codegen-tools.ts toEmbedUrl) BİREBİR aynı mantık tutulmalı.
function toEmbedUrl(url: string): string {
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

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

function CategoryGridComponent({ props }: {
  props: {
    title: string | null;
    columns: "2" | "3" | "4" | null;
    maxItems: number | null;
  };
}) {
  const categories = useStateValue<CategoryGridItem[]>("/categories") ?? [];
  return (
    <CategoryGridSection
      data={{
        title: props.title ?? undefined,
        columns: props.columns ?? undefined,
        maxItems: props.maxItems ?? undefined,
        categories,
      }}
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

  FAQ: ({ props }) => (
    <section className="container mx-auto px-4 py-16">
      {props.title && (
        <h2 className="mb-8 text-center text-2xl font-bold">{props.title}</h2>
      )}
      <div className="mx-auto max-w-3xl divide-y divide-border">
        {props.items.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between font-medium">
              {item.question}
              <span className="ml-2 transition group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  ),

  Testimonials: ({ props }) => (
    <section className="container mx-auto px-4 py-16">
      {props.title && (
        <h2 className="mb-8 text-center text-2xl font-bold">{props.title}</h2>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {props.items.map((t, i) => (
          <figure key={i} className="rounded-lg border border-border p-6">
            <blockquote className="text-sm">{t.quote}</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {t.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.avatarUrl}
                  alt={t.author}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <div className="text-sm font-medium">{t.author}</div>
                {t.role && (
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  ),

  TrustBadges: ({ props }) => (
    <section className="container mx-auto px-4 py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {props.items.map((b, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            {b.icon && <div className="mb-2 text-3xl">{b.icon}</div>}
            <div className="font-medium">{b.title}</div>
            {b.description && (
              <div className="text-sm text-muted-foreground">{b.description}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  ),

  RichText: ({ props }) => (
    <section className="container mx-auto px-4 py-12">
      <div
        className="mx-auto max-w-3xl text-sm leading-relaxed [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    </section>
  ),

  Spacer: ({ props }) => (
    <div className={SPACER_SIZES[props.size ?? "md"] ?? "h-8"} aria-hidden="true" />
  ),

  VideoEmbed: ({ props }) => (
    <section className="container mx-auto px-4 py-12">
      {props.title && (
        <h2 className="mb-6 text-center text-2xl font-bold">{props.title}</h2>
      )}
      <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-lg">
        {isVideoFile(props.url) ? (
          <video src={props.url} controls className="h-full w-full" />
        ) : (
          <iframe
            src={toEmbedUrl(props.url)}
            title={props.title ?? "video"}
            className="h-full w-full"
            allowFullScreen
          />
        )}
      </div>
    </section>
  ),

  FeatureGrid: ({ props }) => {
    const cols = props.columns ?? "3";
    const colClass: Record<string, string> = {
      "2": "sm:grid-cols-2",
      "3": "sm:grid-cols-2 lg:grid-cols-3",
      "4": "sm:grid-cols-2 lg:grid-cols-4",
    };
    return (
      <section className="container mx-auto px-4 py-16">
        {props.title && (
          <h2 className="mb-8 text-center text-2xl font-bold">{props.title}</h2>
        )}
        <div className={`grid gap-6 ${colClass[cols] ?? colClass["3"]}`}>
          {props.items.map((f, i) => (
            <div key={i} className="rounded-lg border border-border p-6">
              {f.icon && <div className="mb-3 text-3xl">{f.icon}</div>}
              <div className="font-medium">{f.title}</div>
              {f.description && (
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  },

  Countdown: ({ props }) => (
    <CountdownSection
      data={{
        targetDate: props.targetDate,
        title: props.title ?? undefined,
        expiredText: props.expiredText ?? undefined,
      }}
    />
  ),

  CategoryGrid: ({ props }) => <CategoryGridComponent props={props} />,

  NewsletterSignup: ({ props }) => (
    <NewsletterSignupSection
      data={{
        title: props.title ?? undefined,
        subtitle: props.subtitle ?? undefined,
      }}
    />
  ),
  },
});
