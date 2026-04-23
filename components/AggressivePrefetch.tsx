'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

/**
 * Light-touch prefetch after idle so Lighthouse / mobile LCP are not starved
 * by competing network and main-thread work on first paint.
 */
export default function AggressivePrefetch() {
  const pathname = usePathname()
  const router = useRouter()

  const prefetchCategories = useCallback(() => {
    if (typeof window === 'undefined') return

    const categories = [
      '/news',
      '/entertainment',
      '/sports',
      '/health-fitness',
      '/editorial',
      '/technology',
      '/automobiles',
      '/about-us',
      '/contact-us',
    ]

    categories.forEach((path) => {
      try {
        router.prefetch(path)
      } catch {
        // ignore
      }
    })
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const run = () => {
      try {
        router.prefetch('/')
        prefetchCategories()
      } catch {
        // ignore
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 5000 })
    } else {
      setTimeout(run, 3500)
    }
  }, [router, prefetchCategories])

  useEffect(() => {
    if (!pathname) return

    const isCategory =
      pathname.startsWith('/news') ||
      pathname.startsWith('/entertainment') ||
      pathname.startsWith('/sports') ||
      pathname.startsWith('/health-fitness') ||
      pathname.startsWith('/editorial') ||
      pathname.startsWith('/technology') ||
      pathname.startsWith('/automobiles')

    if (!isCategory && !pathname.startsWith('/author/')) return

    const run = () => {
      try {
        prefetchCategories()
        if (pathname.startsWith('/author/')) {
          router.prefetch('/')
        }
        const parts = pathname.split('/').filter(Boolean)
        if (parts.length === 2 && parts[0] !== 'author' && parts[0] !== 'admin') {
          router.prefetch(`/${parts[0]}`)
        }
      } catch {
        // ignore
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 6000 })
    } else {
      setTimeout(run, 4000)
    }
  }, [pathname, router, prefetchCategories])

  return null
}
