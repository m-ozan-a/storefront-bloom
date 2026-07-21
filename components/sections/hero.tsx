import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroData {
  heading: string;
  subheading?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
}

export type HeroVariant = "centered" | "simple" | "split";

function HeroCta({ data, inverted }: { data: HeroData; inverted?: boolean }) {
  if (!data.ctaText || !data.ctaUrl) return null;
  return (
    <Button
      asChild
      size="lg"
      variant={inverted ? "secondary" : "default"}
      className="mt-2"
    >
      <Link href={data.ctaUrl}>
        {data.ctaText} <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

function CenteredHero({ data }: { data: HeroData }) {
  const hasImage = Boolean(data.imageUrl);
  return (
    <section className="relative w-full overflow-hidden">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl as string}
          alt={data.heading}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {hasImage ? <div className="absolute inset-0 bg-foreground/40" /> : null}

      <div
        className={`container relative mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center ${
          hasImage ? "text-background" : "text-foreground"
        }`}
      >
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {data.heading}
        </h1>
        {data.subheading ? (
          <p
            className={`max-w-xl text-lg ${
              hasImage ? "text-background/80" : "text-muted-foreground"
            }`}
          >
            {data.subheading}
          </p>
        ) : null}
        <HeroCta data={data} inverted={hasImage} />
      </div>
    </section>
  );
}

function SimpleHero({ data }: { data: HeroData }) {
  return (
    <section className="w-full border-b bg-muted/30">
      <div className="container mx-auto flex flex-col items-start gap-4 px-4 py-16 md:py-24">
        <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
          {data.heading}
        </h1>
        {data.subheading ? (
          <p className="max-w-xl text-lg text-muted-foreground">
            {data.subheading}
          </p>
        ) : null}
        <HeroCta data={data} />
      </div>
    </section>
  );
}

function SplitHero({ data }: { data: HeroData }) {
  const hasImage = Boolean(data.imageUrl);
  return (
    <section className="w-full">
      <div className="container mx-auto grid items-stretch gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:py-20">
        <div className="flex flex-col justify-center gap-6">
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            {data.heading}
          </h1>
          {data.subheading ? (
            <p className="max-w-xl text-lg text-muted-foreground">
              {data.subheading}
            </p>
          ) : null}
          <HeroCta data={data} />
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-muted md:min-h-[420px]">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl as string}
              alt={data.heading}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HeroSection({
  data,
  variant = "centered",
}: {
  data: HeroData;
  variant?: HeroVariant;
}) {
  if (variant === "simple") return <SimpleHero data={data} />;
  if (variant === "split") return <SplitHero data={data} />;
  return <CenteredHero data={data} />;
}
