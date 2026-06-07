import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header, Footer } from '@/components/layout';
import { CartDrawer, WishlistDrawer } from '@/components/cart';
import { AuthProvider } from '@/components/auth';
import { getManifest } from '@/lib/owuan';
import type { Manifest } from '@/lib/owuan/types';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Owuan | Modern Women\'s Fashion',
    template: '%s | Owuan',
  },
  description: 'Discover timeless elegance with Owuan. Shop our curated collection of modern women\'s fashion including dresses, tops, pants, and accessories.',
  keywords: ['women\'s fashion', 'clothing', 'dresses', 'tops', 'elegant fashion', 'modern style'],
  authors: [{ name: 'Owuan' }],
  creator: 'Owuan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Owuan',
    title: 'Owuan | Modern Women\'s Fashion',
    description: 'Discover timeless elegance with Owuan.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Owuan | Modern Women\'s Fashion',
    description: 'Discover timeless elegance with Owuan.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1d1b' },
  ],
};

async function getManifestStore(): Promise<Manifest['store'] | null> {
  try {
    const manifest = await getManifest();
    return manifest.store ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await getManifestStore();

  const googleAnalyticsId = store?.googleAnalyticsId;
  const facebookPixelId = store?.facebookPixelId;
  const tiktokPixelId = store?.tiktokPixelId;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
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

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
