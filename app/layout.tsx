import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header, Footer } from '@/components/layout';
import { SpecSection } from '@/components/sections/SpecSection';
import { IframeNavigator } from '@/components/layout/iframe-navigator';
import { ClientDrawers } from '@/components/layout/client-drawers';
import { AuthProvider } from '@/components/auth';
import { OrganizationLd, WebSiteLd } from '@/components/seo/json-ld';
import { getManifest } from '@/lib/owuan';
import { generateThemeCSS } from '@/lib/theme-css';
import type { Manifest, ManifestTheme } from '@/lib/owuan/types';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

async function getDomainHeader(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const host = h.get("host") || "";
    const domain = host.split(":")[0];
    return { "X-Store-Domain": domain };
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const manifest = await getManifest(await getDomainHeader());
    const store = manifest.store;
    const siteName = store.name || 'Owuan';
    return {
      title: {
        default: store.metaTitle || `${siteName} | Modern Fashion`,
        template: `%s | ${siteName}`,
      },
      description: store.metaDescription || store.description || 'Discover timeless elegance with Owuan.',
      keywords: ['fashion', 'clothing', 'dresses', 'tops', 'elegant fashion', 'modern style'],
      authors: [{ name: siteName }],
      creator: siteName,
      openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName,
        title: store.metaTitle || `${siteName} | Modern Fashion`,
        description: store.metaDescription || store.description || '',
        images: store.ogImage ? [{ url: store.ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: store.metaTitle || `${siteName} | Modern Fashion`,
        description: store.metaDescription || store.description || '',
      },
      robots: { index: true, follow: true },
      icons: store.favicon ? { icon: store.favicon } : undefined,
    };
  } catch {
    return {
      title: { default: 'Owuan | Modern Fashion', template: '%s | Owuan' },
      description: 'Discover timeless elegance with Owuan.',
    };
  }
}

export async function generateViewport(): Promise<Viewport> {
  try {
    const manifest = await getManifest(await getDomainHeader());
    const primaryColor = manifest.activeTheme?.colors?.light?.primary;
    const bgColor = manifest.activeTheme?.colors?.light?.background;
    return {
      width: 'device-width',
      initialScale: 1,
      themeColor: [
        { media: '(prefers-color-scheme: light)', color: bgColor || '#faf9f7' },
        ...(primaryColor ? [{ media: '(prefers-color-scheme: dark)' as const, color: primaryColor }] : []),
      ],
    };
  } catch {
    return {
      width: 'device-width',
      initialScale: 1,
      themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
        { media: '(prefers-color-scheme: dark)', color: '#1f1d1b' },
      ],
    };
  }
}

async function getStoreData(): Promise<{
  store: Manifest['store'] | null;
  activeTheme: ManifestTheme | null;
}> {
  try {
    const h = await headers();
    const host = h.get("host") || "";
    const domain = host.split(":")[0];
    const domainHeaders: Record<string, string> = { "X-Store-Domain": domain };
    const manifest = await getManifest(domainHeaders);
    return { store: manifest.store ?? null, activeTheme: manifest.activeTheme ?? null };
  } catch {
    return { store: null, activeTheme: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { store, activeTheme } = await getStoreData();

  const googleAnalyticsId = store?.googleAnalyticsId;
  const facebookPixelId = store?.facebookPixelId;
  const tiktokPixelId = store?.tiktokPixelId;
  const otherPixelId = store?.otherPixelId;
  const themeCSS = generateThemeCSS(activeTheme);
  const customCSS = activeTheme?.customCss || null;
  const customHeadHTML = activeTheme?.customHeadHtml || null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {customHeadHTML && (
          <Script id="theme-custom-head" strategy="beforeInteractive">
            {customHeadHTML}
          </Script>
        )}
        {themeCSS && (
          <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCSS }} />
        )}
        {customCSS && (
          <style id="theme-custom-css" dangerouslySetInnerHTML={{ __html: customCSS }} />
        )}
        <AuthProvider>
          <Suspense fallback={null}>
            <IframeNavigator />
          </Suspense>
          <Header />
          {/* Faz G — header ek içerik bölgesi (spec yoksa null). Çekirdek header sabit. */}
          <SpecSection spec={activeTheme?.headerSpec ?? null} />
          {children}
          {/* Faz G — footer ek içerik bölgesi (spec yoksa null). Çekirdek footer sabit. */}
          <SpecSection spec={activeTheme?.footerSpec ?? null} />
          <Footer />
          <ClientDrawers />
        </AuthProvider>

        {/* Google Analytics (gtag.js) */}
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {/* Facebook (Meta) Pixel */}
        {facebookPixelId && (
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* TikTok Pixel */}
        {tiktokPixelId && (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
                e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        )}

        {/* Custom Third-Party Pixel */}
        {otherPixelId && (
          <Script id="other-pixel-init" strategy="afterInteractive">
            {otherPixelId}
          </Script>
        )}

        {/* JSON-LD Structured Data */}
        {store && (
          <>
            <OrganizationLd store={store} />
            <WebSiteLd
              siteName={store.name}
              siteUrl={siteUrl}
              searchUrl={`${siteUrl}/search`}
            />
          </>
        )}

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
