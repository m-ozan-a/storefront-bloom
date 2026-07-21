import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/actions";
import { getStorefrontManifest } from "@/actions";
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
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-5">{page.title}</h1>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </main>
  );
}
