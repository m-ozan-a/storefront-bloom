import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { Outfit, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header, Footer } from '@/components/layout';
import { IframeNavigator } from '@/components/layout/iframe-navigator';
import { ClientDrawers } from '@/components/layout/client-drawers';
import { AuthProvider } from '@/components/auth';
import { WebSiteLd } from '@/components/seo/json-ld';
import { getStorefrontManifest, getHeaderData, getFooterData } from '@/actions';
import { generateThemeCssFromManifest, googleFontsUrl } from '@/lib/theme-css';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600'] });

export async function generateMetadata(): Promise<Metadata> {
  const manifest = await getStorefrontManifest();
  const store = manifest?.store;
  const siteName = store?.name || 'Mağaza';
  const title = store?.meta?.title || siteName;
  const description = store?.meta?.description || store?.description || '';
  return {
    title: { default: title, template: `%s | ${siteName}` },
    description,
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      images: store?.ogImage ? [store.ogImage] : undefined,
    },
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
  const fontsUrl = googleFontsUrl(manifest?.theme);
  const customCSS = (manifest?.theme?.customCss as string) || null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';
  const googleAnalyticsId = analytics.gtagId ?? analytics.googleAnalyticsId;
  const facebookPixelId = analytics.facebookPixelId;

  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${inter.variable} bg-background`}>
      <head>
        {fontsUrl ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={fontsUrl} />
          </>
        ) : null}
      </head>
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
          <div className="border-t border-background/10 bg-foreground py-4">
            <a
              href="https://www.owuan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 px-5 text-xs text-background/70 transition-colors hover:text-background"
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
