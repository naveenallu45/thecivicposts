'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { preloadAllCategories } from '@/lib/category-cache'

/**
 * Deferred category warm-cache so the first view (hero LCP) is not competing
 * with many parallel API requests during Lighthouse / slow networks.
 */
export default function HomepagePrefetch() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const categories = [
      '/news',
      '/entertainment',
      '/sports',
      '/health-fitness',
      '/editorial',
      '/technology',
      '/automobiles',
    ]

    const run = () => {
      categories.forEach((path) => {
        try {
          router.prefetch(path)
        } catch {
          // ignore
        }
      })
      try {
        preloadAllCategories()
      } catch {
        // ignore
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 8000 })
    } else {
      setTimeout(run, 5000)
    }
  }, [router])

  return null
}
