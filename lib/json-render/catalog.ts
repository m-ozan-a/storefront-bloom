import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";

const heroVariants = z.enum([
  "centered",
  "split-left",
  "split-right",
  "fullscreen-video",
  "minimal-text",
]);

const bannerVariants = z.enum(["card-overlay", "text-below"]);
const carouselVariants = z.enum(["full-width", "thumbnail-nav"]);

export const catalog = defineCatalog(schema, {
  components: {
    // Layout primitives from shadcn (agent can compose these freely)
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Image: shadcnComponentDefinitions.Image,
    Badge: shadcnComponentDefinitions.Badge,
    Button: shadcnComponentDefinitions.Button,
    Separator: shadcnComponentDefinitions.Separator,

    // Storefront section components (owuan custom)
    Hero: {
      props: z.object({
        heading: z.string(),
        subheading: z.string().nullable(),
        ctaText: z.string().nullable(),
        ctaUrl: z.string().nullable(),
        imageUrl: z.string().nullable(),
        videoUrl: z.string().nullable(),
        variant: heroVariants.nullable(),
      }),
      description:
        "Ana sayfa hero bölümü. variant: centered (varsayılan), split-left, split-right, fullscreen-video, minimal-text",
    },

    Banner: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        imageUrl: z.string(),
        linkUrl: z.string(),
        variant: bannerVariants.nullable(),
      }),
      description:
        "Kategori/kampanya banner kartı. variant: card-overlay (varsayılan), text-below",
    },

    BannerGroup: {
      props: z.object({
        columns: z.enum(["1", "2", "3"]).nullable(),
      }),
      description:
        "Banner'ları yan yana gruplar. children olarak Banner component'leri alır. columns: 1-3",
    },

    Carousel: {
      props: z.object({
        title: z.string().nullable(),
        images: z.array(
          z.object({
            url: z.string(),
            alt: z.string().nullable(),
            linkUrl: z.string().nullable(),
          })
        ),
        variant: carouselVariants.nullable(),
      }),
      description:
        "Görsel carousel/slider. variant: full-width (varsayılan), thumbnail-nav",
    },

    ProductCarousel: {
      props: z.object({
        title: z.string(),
        collection: z.string().nullable(),
        tag: z.string().nullable(),
        maxItems: z.number().nullable(),
      }),
      description:
        "Ürün carousel'i. collection veya tag ile filtrelenir. maxItems varsayılan 8",
    },
  },
  actions: {},
});

export type StorefrontCatalog = typeof catalog;
