import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BloomHeroProps {
  storeName: string;
}

const HERO_VIDEO_URL = 'https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/Bring_a_bit_202602041404_u6uf6-01KGMC3H3BPBGYA1KXAMFFT0AM.mp4';

export function BloomHero({ storeName }: BloomHeroProps) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 w-full h-[100vh] overflow-hidden -z-10">
        <video
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
      </div>

      <div className="relative -mt-[100vh] pt-48 h-[100vh] flex items-center justify-center">
        <div className="content-container text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-serif)] font-semibold text-neutral-900 mb-6 tracking-tight">
            Movement, simplified.
          </h1>
          <p className="md:text-xl mb-8 max-w-2xl mx-auto text-white">
            Scandinavian-inspired athleisure designed for everyday balance.
          </p>
          <Link
            href="/search?collection=core-essentials"
            className="inline-flex items-center gap-2 bg-neutral-900 text-neutral-50 px-8 py-4 hover:bg-neutral-800 transition-colors uppercase text-xs font-semibold tracking-wider"
          >
            Shop Core Essentials
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
