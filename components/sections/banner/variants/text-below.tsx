import Image from "next/image";
import Link from "next/link";

interface BannerData {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  variant?: string;
}

export function BannerTextBelow({ data }: { data: BannerData }) {
  return (
    <Link
      href={data.linkUrl}
      className="group block rounded-lg overflow-hidden border border-border bg-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={data.imageUrl}
          alt={data.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
        )}
      </div>
    </Link>
  );
}
