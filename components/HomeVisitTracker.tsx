'use client'

import { useEffect } from 'react'

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

    trackVisit()
  }, [])

  return null
}
