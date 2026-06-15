import type { ManifestStore, Product } from "@/lib/owuan/types";

interface OrganizationLdProps {
  store: ManifestStore;
}

export function OrganizationLd({ store }: OrganizationLdProps) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.name,
    url: store.domain ? `https://${store.domain}` : undefined,
    logo: store.logoUrl || undefined,
    description: store.description || undefined,
    email: store.email,
    telephone: store.phone,
    address: store.address
      ? {
          "@type": "PostalAddress",
          streetAddress: store.address,
        }
      : undefined,
    sameAs: undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

interface ProductLdProps {
  product: Product;
  storeName: string;
}

export function ProductLd({ product, storeName }: ProductLdProps) {
  const price = parseFloat(
    product.priceRange.minVariantPrice.amount
  );

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    sku: product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers:
      product.availableForSale && price > 0
        ? {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: product.priceRange.minVariantPrice.currencyCode,
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: storeName,
            },
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

interface BreadcrumbLdProps {
  items: { name: string; href: string }[];
}

export function BreadcrumbLd({ items }: BreadcrumbLdProps) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

interface WebSiteLdProps {
  siteName: string;
  siteUrl: string;
  searchUrl?: string;
}

export function WebSiteLd({ siteName, siteUrl, searchUrl }: WebSiteLdProps) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };

  if (searchUrl) {
    ld.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
