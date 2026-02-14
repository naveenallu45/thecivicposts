'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshWrapperProps {
  children: React.ReactNode
  interval?: number // Refresh interval in seconds
}

export default function AutoRefreshWrapper({ 
  children, 
  interval = 30 // Default 30 seconds
}: AutoRefreshWrapperProps) {
  const router = useRouter()

  useEffect(() => {
    // Auto-refresh the page data at specified interval
    const refreshInterval = setInterval(() => {
      router.refresh()
    }, interval * 1000) // Convert seconds to milliseconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval)
  }, [router, interval])

  return <>{children}</>
}
