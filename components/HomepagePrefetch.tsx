'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { preloadAllCategories } from '@/lib/category-cache'

/**
 * Aggressively prefetches ALL category articles when homepage loads
 * Production-level optimization for instant category navigation
 */
export default function HomepagePrefetch() {
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Prefetch all category pages
    const categories = [
      '/news',
      '/entertainment',
      '/sports',
      '/health-fitness',
      '/editorial',
      '/technology',
      '/automobiles',
    ]

    // IMMEDIATE: Prefetch all category pages with highest priority
    categories.forEach((category) => {
      try {
        router.prefetch(category)
      } catch {
        // Silently fail
      }
    })

    // Only proceed if document is available
    if (typeof document === 'undefined') return

    // IMMEDIATE: Preload all category articles into cache
    try {
      preloadAllCategories()
    } catch {
      // Silently fail
    }

    // IMMEDIATE: Prefetch category API endpoints for instant data loading
    categories.forEach((category) => {
      try {
        const categoryName = category.replace('/', '')
        // Prefetch first page API
        const apiUrl = `/api/articles?category=${categoryName}&page=1&limit=10`
        const link1 = document.createElement('link')
        link1.rel = 'prefetch'
        link1.href = apiUrl
        link1.as = 'fetch'
        link1.crossOrigin = 'anonymous'
        document.head.appendChild(link1)

        // Also fetch the data immediately to cache it
        if (typeof fetch !== 'undefined') {
          fetch(apiUrl, { method: 'GET', cache: 'force-cache' }).catch(() => {
            // Silently fail
          })
        }
      } catch {
        // Silently fail
      }
    })

    // IMMEDIATE: Prefetch the all articles API
    try {
      const allArticlesLink = document.createElement('link')
      allArticlesLink.rel = 'prefetch'
      allArticlesLink.href = '/api/articles/all?limit=10&page=1'
      allArticlesLink.as = 'fetch'
      allArticlesLink.crossOrigin = 'anonymous'
      document.head.appendChild(allArticlesLink)

      // Also fetch immediately to cache
      if (typeof fetch !== 'undefined') {
        fetch('/api/articles/all?limit=10&page=1', { method: 'GET', cache: 'force-cache' }).catch(() => {
          // Silently fail
        })
      }
    } catch {
      // Silently fail
    }

    // IMMEDIATE: Prefetch second pages as well (don't wait for idle)
    categories.forEach((category) => {
      try {
        const categoryName = category.replace('/', '')
        const apiUrl = `/api/articles?category=${categoryName}&page=2&limit=10`
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = apiUrl
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      } catch {
        // Silently fail
      }
    })

    // Use requestIdleCallback for third pages (lower priority)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        categories.forEach((category) => {
          try {
            const categoryName = category.replace('/', '')
            const apiUrl = `/api/articles?category=${categoryName}&page=3&limit=10`
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = apiUrl
            link.as = 'fetch'
            link.crossOrigin = 'anonymous'
            document.head.appendChild(link)
          } catch {
            // Silently fail
          }
        })
      }, { timeout: 1000 })
    }
  }, [router])

  return null
}
