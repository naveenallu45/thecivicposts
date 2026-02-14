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
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
