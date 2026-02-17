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
  const isAuthorRoute = pathname?.startsWith('/author')
  const isHomepage = pathname === '/'

  // Exclude admin and author routes from public layout (header/footer)
  if (isAdminRoute || isAuthorRoute) {
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
