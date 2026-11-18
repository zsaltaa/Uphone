import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-jakarta',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-serif-editorial',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Uphone',
  description:
    'Cross-platform mobile-desktop AI roleplay chat workspace with character memory management.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Uphone',
  },
  openGraph: {
    title: 'Uphone',
    description:
      'Cross-platform mobile-desktop AI roleplay chat workspace with character memory management.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uphone',
    description:
      'Cross-platform mobile-desktop AI roleplay chat workspace with character memory management.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
