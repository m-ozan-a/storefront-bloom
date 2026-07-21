import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BloomEditorialProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  imagePlaceholder?: string;
  reversed?: boolean;
}

export function BloomEditorial({
  title,
  description,
  ctaText,
  ctaHref,
  imageUrl,
  imagePlaceholder = 'Lifestyle Image',
  reversed = false,
}: BloomEditorialProps) {
  return (
    <section className="py-24 bg-muted">
      <div className="content-container">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
          <div className={reversed ? 'lg:order-2' : ''}>
            <div className="aspect-[4/5] bg-accent/10 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">{imagePlaceholder}</span>
                </div>
              )}
            </div>
          </div>

          <div className={reversed ? 'lg:order-1' : ''}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-serif)] font-semibold text-foreground mb-6 tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {description}
            </p>
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors uppercase text-xs font-semibold tracking-wider"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
