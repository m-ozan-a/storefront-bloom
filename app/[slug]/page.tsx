import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// İçerik sayfaları yavaş değişir → 1 saatlik ISR.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-5">
        {page.title}
      </h1>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </main>
  );
}
