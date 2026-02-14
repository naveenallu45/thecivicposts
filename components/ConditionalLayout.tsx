'use client'

import { usePathname } from 'next/navigation'
import HeaderNav from './HeaderNav'
import Footer from './Footer'
import AdSense from './AdSense'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  // Get AdSense client ID from environment variable
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''

  return (
    <>
      <HeaderNav />
      <main className="flex-grow">{children}</main>
      <Footer />
      {/* Only load AdSense on public pages */}
      {adClient && <AdSense adClient={adClient} />}
    </>
  )
}
