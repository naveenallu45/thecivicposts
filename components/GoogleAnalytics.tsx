'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // Track page views when route changes
  useEffect(() => {
    // Only track in production and if measurement ID is provided
    if (process.env.NODE_ENV !== 'production' || !gaMeasurementId) {
      return
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', gaMeasurementId, {
        page_path: pathname,
      })
    }
  }, [pathname, gaMeasurementId])

  // Only render in production and if measurement ID is provided
  if (process.env.NODE_ENV !== 'production' || !gaMeasurementId) {
    return null
  }

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}
