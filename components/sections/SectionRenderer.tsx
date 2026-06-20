import type { SectionsData } from "@/lib/owuan/types";
import { HeroCentered } from "./hero/variants/centered";
import { HeroSplitLeft } from "./hero/variants/split-left";
import { HeroSplitRight } from "./hero/variants/split-right";
import { HeroFullscreenVideo } from "./hero/variants/fullscreen-video";
import { HeroMinimalText } from "./hero/variants/minimal-text";
import { BannerCardOverlay } from "./banner/variants/card-overlay";
import { BannerTextBelow } from "./banner/variants/text-below";
import { CarouselFullWidth } from "./carousel/variants/full-width";
import { CarouselThumbnailNav } from "./carousel/variants/thumbnail-nav";

type HeroData = NonNullable<NonNullable<SectionsData["homepage"]>["hero"]>;
type BannerData = NonNullable<NonNullable<SectionsData["homepage"]>["banners"]>;
type CarouselData = NonNullable<NonNullable<SectionsData["homepage"]>["carousels"]>;

const HERO_VARIANTS: Record<string, React.ComponentType<{ data: HeroData }>> = {
  centered: HeroCentered,
  "split-left": HeroSplitLeft,
  "split-right": HeroSplitRight,
  "fullscreen-video": HeroFullscreenVideo,
  "minimal-text": HeroMinimalText,
};

const BANNER_VARIANTS: Record<string, React.ComponentType<{ data: BannerData[number] }>> = {
  "card-overlay": BannerCardOverlay,
  "text-below": BannerTextBelow,
};

const CAROUSEL_VARIANTS: Record<string, React.ComponentType<{ data: CarouselData[number] }>> = {
  "full-width": CarouselFullWidth,
  "thumbnail-nav": CarouselThumbnailNav,
};

export function HeroSectionRenderer({ data }: { data: HeroData }) {
  const variant = data.variant || "centered";
  const Component = HERO_VARIANTS[variant] || HeroCentered;
  return <Component data={data} />;
}

export function BannerSectionRenderer({ data }: { data: BannerData }) {
  const variant = data[0]?.variant || "card-overlay";
  return (
    <section className="container mx-auto px-4 py-16">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)` }}
      >
        {data.map((banner, i) => {
          const BannerVariant = BANNER_VARIANTS[banner.variant || "card-overlay"] || BannerCardOverlay;
          return <BannerVariant key={i} data={banner} />;
        })}
      </div>
    </section>
  );
}

export function CarouselSectionRenderer({ data }: { data: CarouselData }) {
  const variant = data[0]?.variant || "full-width";
  const CarouselVariant = CAROUSEL_VARIANTS[variant] || CarouselFullWidth;
  return (
    <>
      {data.map((carousel, ci) => (
        <section key={ci} className="container mx-auto px-4 py-16">
          <CarouselVariant data={carousel} />
        </section>
      ))}
    </>
  );
}
