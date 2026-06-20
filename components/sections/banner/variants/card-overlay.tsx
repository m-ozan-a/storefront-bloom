import Image from "next/image";
import Link from "next/link";

interface BannerData {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  variant?: string;
}

export function BannerCardOverlay({ data }: { data: BannerData }) {
  return (
    <Link
      href={data.linkUrl}
      className="group relative overflow-hidden rounded-lg aspect-[3/2]"
    >
      <Image
        src={data.imageUrl}
        alt={data.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-lg font-bold text-background">{data.title}</h3>
        {data.description && (
          <p className="text-sm text-background/80 mt-1">{data.description}</p>
        )}
      </div>
    </Link>
  );
}
