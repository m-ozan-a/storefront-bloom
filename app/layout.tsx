import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header, Footer } from '@/components/layout';
import { CartDrawer, WishlistDrawer } from '@/components/cart';
import { AuthProvider } from '@/components/auth';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
