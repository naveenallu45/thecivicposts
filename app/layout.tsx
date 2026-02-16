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
  title: 'The Civic Posts - Latest News & Articles',
  description: 'Stay informed with the latest news, entertainment, sports, health & fitness, and editorial content',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thecivicposts.com'),
  openGraph: {
    title: 'The Civic Posts',
    description: 'Stay informed with the latest news, entertainment, sports, health & fitness, and editorial content',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Civic Posts',
    description: 'Stay informed with the latest news, entertainment, sports, health & fitness, and editorial content',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${merriweather.variable}`}>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
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
