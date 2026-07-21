import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Alan adları spec ile birebir (specs/homepage.json → Banner props).
export interface BannerData {
  imageUrl: string;
  title: string;
  description?: string;
  ctaText: string;
  linkUrl: string;
}

// Placeholder'lar — spec/codegen banners prop'u geçmezse bu veri render edilir.
const DEFAULT_DUO: BannerData[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    title: "Yeni Sezon İndirimleri",
    description: "Seçili ürünlerde %50'ye varan fırsatlar",
    ctaText: "Keşfet",
    linkUrl: "/search",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    title: "Aksesuar Dünyası",
    description: "Kombininizi tamamlayacak detaylar",
    ctaText: "Alışverişe Başla",
    linkUrl: "/search",
  },
];

const DEFAULT_WIDE: BannerData = {
  imageUrl:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
  title: "Premium Koleksiyon",
  description: "Özenle seçilmiş parçalar, sınırlı stoklarla sizlerle.",
  ctaText: "Koleksiyonu Gör",
  linkUrl: "/search",
};

function BannerCta({ text }: { text: string }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-background">
      <span className="underline decoration-background/40 underline-offset-4 transition-colors group-hover:decoration-background">
        {text}
      </span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );
}

export function PromoBannersDuo({ banners }: { banners?: BannerData[] }) {
  const items = banners && banners.length > 0 ? banners : DEFAULT_DUO;
  return (
    <section className="grid w-full gap-4 px-5 py-5 sm:grid-cols-2">
      {items.map((b, i) => (
        <Link
          key={i}
          href={b.linkUrl}
          className="group relative block h-56 overflow-hidden rounded-lg md:h-72"
        >
          <Image
            src={b.imageUrl}
            alt={b.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5 text-background md:p-6">
            <h3 className="font-serif text-xl font-bold md:text-2xl">{b.title}</h3>
            {b.description && <p className="max-w-xs text-sm text-background/80">{b.description}</p>}
            <BannerCta text={b.ctaText} />
          </div>
        </Link>
      ))}
    </section>
  );
}

export function PromoBannerWide({ banner }: { banner?: BannerData }) {
  const b = banner ?? DEFAULT_WIDE;
  return (
    <section className="w-full px-5 py-5">
      <Link
        href={b.linkUrl}
        className="group relative block h-56 overflow-hidden rounded-lg md:h-80"
      >
        <Image
          src={b.imageUrl}
          alt={b.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/35 to-foreground/5" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 px-5 text-background md:px-12">
          <h3 className="max-w-xl font-serif text-2xl font-bold md:text-4xl">{b.title}</h3>
          {b.description && (
            <p className="max-w-md text-sm text-background/80 md:text-base">{b.description}</p>
          )}
          <BannerCta text={b.ctaText} />
        </div>
      </Link>
    </section>
  );
}
