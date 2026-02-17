import type { Metadata } from 'next'
import { Inter, Roboto, Playfair_Display, Merriweather } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

const playfair = Playfair_Display({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Civic Posts - Latest News & Articles',
    template: '%s | The Civic Posts',
  },
  description: 'Stay informed with the latest news, entertainment, sports, health & lifestyle, and editorial content. Breaking news, trending stories, and in-depth articles.',
  keywords: [
    'news',
    'latest news',
    'breaking news',
    'entertainment',
    'sports',
    'health',
    'lifestyle',
    'editorial',
    'technology',
    'automobiles',
    'the civic posts',
    'civic posts',
    'news articles',
    'daily news',
    'current events',
  ],
  authors: [{ name: 'The Civic Posts' }],
  creator: 'The Civic Posts',
  publisher: 'The Civic Posts',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thecivicposts.com'),
  applicationName: 'The Civic Posts',
  referrer: 'origin-when-cross-origin',
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Civic Posts',
  },
  openGraph: {
    title: 'The Civic Posts - Latest News & Articles',
    description: 'Stay informed with the latest news, entertainment, sports, health & lifestyle, and editorial content',
    type: 'website',
    locale: 'en_US',
    siteName: 'The Civic Posts',
    url: 'https://www.thecivicposts.com',
    images: [
      {
        url: 'https://www.thecivicposts.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Civic Posts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Civic Posts',
    description: 'Stay informed with the latest news, entertainment, sports, health & lifestyle, and editorial content',
    images: ['https://www.thecivicposts.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.thecivicposts.com',
  },
  verification: {
    google: 'YOUR-VERIFICATION-CODE-HERE',
    // STEP 1: Go to Google Search Console (https://search.google.com/search-console)
    // STEP 2: Add property: https://www.thecivicposts.com
    // STEP 3: Choose "HTML tag" verification method
    // STEP 4: Copy the content value (the long string after content="...")
    // STEP 5: Paste it below, replacing 'YOUR-VERIFICATION-CODE-HERE'
    // Example: google: 'ABC123xyz789...'
    // google: 'YOUR-VERIFICATION-CODE-HERE',
  },
  category: 'news',
  classification: 'News & Media',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${merriweather.variable}`}>
      <head>
        {/* Browser Search Optimization - Help users find the site easily */}
        <meta name="application-name" content="The Civic Posts" />
        <meta name="apple-mobile-web-app-title" content="Civic Posts" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Search Engine Keywords for Browser Autocomplete */}
        <meta name="keywords" content="news, latest news, breaking news, entertainment, sports, health, lifestyle, editorial, technology, automobiles, the civic posts, civic posts, news articles, daily news, current events" />
        <meta name="subject" content="News & Media" />
        <meta name="topic" content="News Articles" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        
        {/* Dual CDN Preconnect for fastest image loading */}
        {/* Cloudinary CDN: Source images */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Vercel CDN: Optimized images via Next.js Image Optimization API */}
        {/* Vercel automatically handles CDN preconnect when deployed */}
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Production-level aggressive prefetching for instant loading */}
        <link rel="prefetch" href="/news" as="document" />
        <link rel="prefetch" href="/entertainment" as="document" />
        <link rel="prefetch" href="/sports" as="document" />
        <link rel="prefetch" href="/health-fitness" as="document" />
        <link rel="prefetch" href="/editorial" as="document" />
        <link rel="prefetch" href="/technology" as="document" />
        <link rel="prefetch" href="/automobiles" as="document" />
        <link rel="prefetch" href="/about-us" as="document" />
        <link rel="prefetch" href="/contact-us" as="document" />
        <link rel="prefetch" href="/privacy-policy" as="document" />
        <link rel="prefetch" href="/terms-and-conditions" as="document" />
        {/* Prefetch category API routes for instant data loading */}
        <link rel="prefetch" href="/api/articles?category=news&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=entertainment&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=sports&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=health-fitness&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=editorial&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=technology&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles?category=automobiles&page=1&limit=10" as="fetch" crossOrigin="anonymous" />
        {/* Prefetch API routes */}
        <link rel="prefetch" href="/api/articles" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/api/articles/all?limit=10&page=1" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
