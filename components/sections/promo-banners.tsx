import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface BannerData {
  image: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
}

const DUO: BannerData[] = [
  {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    title: "Yeni Sezon İndirimleri",
    subtitle: "Seçili ürünlerde %50'ye varan fırsatlar",
    ctaText: "Keşfet",
    ctaUrl: "/search",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    title: "Aksesuar Dünyası",
    subtitle: "Kombininizi tamamlayacak detaylar",
    ctaText: "Alışverişe Başla",
    ctaUrl: "/search",
  },
];

const WIDE: BannerData = {
  image:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
  title: "Premium Koleksiyon",
  subtitle: "Özenle seçilmiş parçalar, sınırlı stoklarla sizlerle.",
  ctaText: "Koleksiyonu Gör",
  ctaUrl: "/search",
};

export function PromoBannersDuo() {
  return (
    <section className="container mx-auto grid gap-4 px-4 py-8 sm:grid-cols-2">
      {DUO.map((b, i) => (
        <Link
          key={i}
          href={b.ctaUrl}
          className="group relative block h-56 overflow-hidden rounded-lg md:h-72"
        >
          <Image
            src={b.image}
            alt={b.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/35" />
          <div className="absolute inset-0 flex flex-col justify-center gap-2 p-8 text-background">
            <h3 className="font-serif text-2xl font-bold md:text-3xl">{b.title}</h3>
            {b.subtitle && <p className="max-w-xs text-sm text-background/85">{b.subtitle}</p>}
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
              {b.ctaText} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function PromoBannerWide() {
  return (
    <section className="container mx-auto px-4 py-8">
      <Link
        href={WIDE.ctaUrl}
        className="group relative block h-56 overflow-hidden rounded-lg md:h-80"
      >
        <Image
          src={WIDE.image}
          alt={WIDE.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-background">
          <h3 className="font-serif text-3xl font-bold md:text-4xl">{WIDE.title}</h3>
          <p className="max-w-xl text-background/85">{WIDE.subtitle}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
            {WIDE.ctaText} <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
