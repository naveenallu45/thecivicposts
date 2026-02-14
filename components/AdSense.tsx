'use client'

import Script from 'next/script'

interface AdSenseProps {
  adClient: string
}

export default function AdSense({ adClient }: AdSenseProps) {
  // Only render AdSense in production and if adClient is provided
  if (process.env.NODE_ENV !== 'production' || !adClient) {
    return null
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script id="adsense-init" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({});
        `}
      </Script>
    </>
  )
}
