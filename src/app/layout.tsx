import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Dev Tools',
    default: 'Dev Tools - Developer Utilities Collection',
  },
  description:
    'A comprehensive collection of 34 developer tools for everyday tasks including converters, formatters, generators, and more.',
  keywords: [
    'developer tools',
    'base64 encoder',
    'json formatter',
    'uuid generator',
    'hash generator',
    'regex tester',
    'color converter',
    'markdown previewer',
    'jwt decoder',
    'url encoder',
    'password generator',
  ],
  authors: [{ name: 'bberka', url: 'https://github.com/bberka' }],
  creator: 'bberka',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.ico',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Dev Tools - Developer Utilities Collection',
    description:
      'A comprehensive collection of 34 developer tools for everyday tasks',
    siteName: 'Dev Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dev Tools - Developer Utilities Collection',
    description:
      'A comprehensive collection of 34 developer tools for everyday tasks',
    creator: '@bberka',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flicker - must run before page renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('dev-toolbox:theme') ||
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  localStorage.setItem('dev-toolbox:theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-8">{children}</main>
            <Footer />
            <CommandPalette />
          </div>
        </Providers>
      </body>
    </html>
  );
}
