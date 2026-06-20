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

    FAQ: {
      props: z.object({
        title: z.string().nullable(),
        items: z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        ),
      }),
      description:
        "Sıkça sorulan sorular bölümü. items: [{question, answer}]. Açılır-kapanır (native <details>).",
    },

    Testimonials: {
      props: z.object({
        title: z.string().nullable(),
        items: z.array(
          z.object({
            quote: z.string(),
            author: z.string(),
            role: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
        ),
      }),
      description:
        "Müşteri yorumları/referansları. items: [{quote, author, role?, avatarUrl?}]. Kart grid'i.",
    },

    TrustBadges: {
      props: z.object({
        items: z.array(
          z.object({
            icon: z.string().nullable(),
            title: z.string(),
            description: z.string().nullable(),
          })
        ),
      }),
      description:
        "Güven rozetleri (kargo/iade/güvenli ödeme vb.). items: [{icon? (emoji), title, description?}].",
    },

    RichText: {
      props: z.object({
        html: z.string(),
      }),
      description:
        "Serbest HTML metin bloğu (mağaza sahibinin içeriği). html: gömülü HTML string.",
    },

    Spacer: {
      props: z.object({
        size: z.enum(["sm", "md", "lg", "xl"]).nullable(),
      }),
      description: "Dikey boşluk. size: sm/md/lg/xl (varsayılan md).",
    },

    VideoEmbed: {
      props: z.object({
        url: z.string(),
        title: z.string().nullable(),
      }),
      description:
        "Video gömme. url: YouTube/Vimeo izleme linki veya .mp4/.webm dosyası. 16:9 responsive.",
    },

    FeatureGrid: {
      props: z.object({
        title: z.string().nullable(),
        columns: z.enum(["2", "3", "4"]).nullable(),
        items: z.array(
          z.object({
            icon: z.string().nullable(),
            title: z.string(),
            description: z.string().nullable(),
          })
        ),
      }),
      description:
        "Özellik/hizmet kartları grid'i. items: [{icon? (emoji), title, description?}]. columns: 2/3/4 (varsayılan 3). TrustBadges'ten farkı: kenarlıklı kartlar, sola hizalı, sütun sayısı seçilebilir.",
    },

    Countdown: {
      props: z.object({
        targetDate: z.string(),
        title: z.string().nullable(),
        expiredText: z.string().nullable(),
      }),
      description:
        "Geri sayım sayacı. targetDate: ISO tarih (ör. 2026-12-31T23:59:59). Gün/saat/dakika/saniye gösterir, süre dolunca expiredText.",
    },

    CategoryGrid: {
      props: z.object({
        title: z.string().nullable(),
        columns: z.enum(["2", "3", "4"]).nullable(),
        maxItems: z.number().nullable(),
      }),
      description:
        "Mağaza kategorileri grid'i. Veri manifest'ten otomatik gelir — kategori girmezsin. title?, columns: 2/3/4 (varsayılan 4), maxItems? (gösterilecek kategori sayısı). Her kart /search/<slug> linkine gider.",
    },

    NewsletterSignup: {
      props: z.object({
        title: z.string().nullable(),
        subtitle: z.string().nullable(),
      }),
      description:
        "Bülten/e-posta kayıt formu. title?, subtitle? — ziyaretçi e-postasını toplar ve mağaza backend'ine kaydeder (POST).",
    },
  },
  actions: {},
});

export type StorefrontCatalog = typeof catalog;
