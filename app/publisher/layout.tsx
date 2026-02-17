'use client'

import { useEffect } from 'react'
import { ToastProvider } from '@/contexts/ToastContext'

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add noindex meta tag to block publisher pages from search engines
    const metaRobots = document.createElement('meta')
    metaRobots.name = 'robots'
    metaRobots.content = 'noindex, nofollow'
    document.head.appendChild(metaRobots)

    return () => {
      // Cleanup on unmount
      const existingMeta = document.querySelector('meta[name="robots"]')
      if (existingMeta && existingMeta.getAttribute('content') === 'noindex, nofollow') {
        existingMeta.remove()
      }
    }
  }, [])

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ToastProvider>
  )
}
