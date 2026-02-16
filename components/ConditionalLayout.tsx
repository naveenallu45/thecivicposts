'use client'

import { usePathname } from 'next/navigation'
import HeaderNav from './HeaderNav'
import Footer from './Footer'
import AdSense from './AdSense'
import SmoothScroll from './SmoothScroll'
import PageTransition from './PageTransition'
import AggressivePrefetch from './AggressivePrefetch'
import HomepagePrefetch from './HomepagePrefetch'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isHomepage = pathname === '/'

  if (isAdminRoute) {
    return <>{children}</>
  }

  // Get AdSense client ID from environment variable
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <SmoothScroll />
      <AggressivePrefetch />
      {isHomepage && <HomepagePrefetch />}
      <HeaderNav />
      <PageTransition>
        <main className="flex-grow">{children}</main>
      </PageTransition>
      <Footer />
      {/* Only load AdSense on public pages */}
      {adClient && <AdSense adClient={adClient} />}
    </div>
  )
}
