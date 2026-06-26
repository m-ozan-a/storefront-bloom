import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/owuan";
import { getStorefrontManifest } from "@/lib/owuan/manifest";
import { ContactPage } from "@/components/contact/contact-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "contact") return { title: "İletişim" };
  const page = await getPage(slug);
  if (!page) return { title: "Sayfa Bulunamadı" };
  return { title: page.metaTitle || page.title, description: page.metaDescription || undefined };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "contact") {
    const manifest = await getStorefrontManifest();
    return <ContactPage store={manifest?.store ?? null} />;
  }

  const page = await getPage(slug);
  if (!page || !page.isPublished) notFound();

  return (
    <main className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">{page.title}</h1>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </main>
  );
}
