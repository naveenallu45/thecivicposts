'use client'

import { useEffect } from 'react'

/**
 * Runs after full load + idle so /api/analytics/visit stays off the LCP critical path
 * (Lighthouse often chains early fetch work into "maximum critical path latency").
 */
export default function HomeVisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 'home' }),
          keepalive: true,
        })
      } catch (error) {
        console.error('Home visit tracking failed:', error)
      }
    }

    let idleId = 0
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const runWhenQuiet = () => {
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(() => void trackVisit(), { timeout: 12_000 })
      } else {
        timeoutId = setTimeout(() => void trackVisit(), 5000)
      }
    }

    const onLoad = () => runWhenQuiet()

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      runWhenQuiet()
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', onLoad)
      }
      if (idleId && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return null
}
