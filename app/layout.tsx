import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header, Footer } from '@/components/layout';
import { IframeNavigator } from '@/components/layout/iframe-navigator';
import { ClientDrawers } from '@/components/layout/client-drawers';
import { AuthProvider } from '@/components/auth';
import { WebSiteLd } from '@/components/seo/json-ld';
import { getStorefrontManifest, getHeaderData, getFooterData } from '@/lib/owuan/manifest';
import { generateThemeCssFromManifest } from '@/lib/theme-css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export async function generateMetadata(): Promise<Metadata> {
  const manifest = await getStorefrontManifest();
  const store = manifest?.store;
  const siteName = store?.name || 'Mağaza';
  const title = store?.meta?.title || siteName;
  const description = store?.meta?.description || store?.description || '';
  return {
    title: { default: title, template: `%s | ${siteName}` },
    description,
    openGraph: { type: 'website', siteName, title, description },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
    icons: store?.favicon ? { icon: store.favicon } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const manifest = await getStorefrontManifest();
  const bg = manifest?.theme?.colors?.background;
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: bg ? [{ color: bg }] : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const manifest = await getStorefrontManifest();
  const store = manifest?.store ?? null;
  const headerData = getHeaderData(manifest);
  const footerData = getFooterData(manifest);
  const analytics = manifest?.analytics ?? {};
  const themeCSS = generateThemeCssFromManifest(manifest?.theme);
  const customCSS = (manifest?.theme?.customCss as string) || null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';
  const googleAnalyticsId = analytics.googleAnalyticsId;
  const facebookPixelId = analytics.facebookPixelId;

  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {themeCSS ? <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCSS }} /> : null}
        {customCSS ? <style id="theme-custom-css" dangerouslySetInnerHTML={{ __html: customCSS }} /> : null}

        <AuthProvider>
          <Suspense fallback={null}>
            <IframeNavigator />
          </Suspense>
          <Header data={headerData} />
          {children}
          <Footer data={footerData} />
          <div className="border-t border-border bg-background py-4">
            <a
              href="https://www.owuan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="container mx-auto flex items-center justify-center gap-2 px-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{store?.name ?? 'Bu mağaza'}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/owuan-dots.svg" alt="owuan" className="h-4 w-4" />
              <span>owuan tarafından desteklenmektedir.</span>
            </a>
          </div>
          <ClientDrawers />
        </AuthProvider>

        {googleAnalyticsId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        ) : null}

        {facebookPixelId ? (
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${facebookPixelId}');fbq('track', 'PageView');`}
          </Script>
        ) : null}

        {store ? (
          <WebSiteLd siteName={store.name} siteUrl={siteUrl} searchUrl={`${siteUrl}/search`} />
        ) : null}

        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  );
}
