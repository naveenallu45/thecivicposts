'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

/**
 * Production-level aggressive prefetching for instant page loads
 * Prefetches everything that users might click on
 */
export default function AggressivePrefetch() {
  const pathname = usePathname()
  const router = useRouter()

  // Prefetch all category pages AND their data
  const prefetchCategories = useCallback(() => {
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
      '/privacy-policy',
      '/terms-and-conditions',
    ]
    
    categories.forEach(category => {
      router.prefetch(category)
      
      // Also prefetch API data for category pages
      if (category !== '/' && 
          category !== '/about-us' && 
          category !== '/contact-us' && 
          category !== '/privacy-policy' && 
          category !== '/terms-and-conditions' &&
          typeof window !== 'undefined') {
        const categoryName = category.replace('/', '')
        const apiUrl = `/api/articles?category=${categoryName}&page=1&limit=10`
        
        // Prefetch API link
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = apiUrl
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        
        // Also fetch immediately to cache
        fetch(apiUrl, { method: 'GET', cache: 'force-cache' }).catch(() => {
          // Silently fail
        })
      }
    })
  }, [router])

  // Prefetch API routes that might be called
  const prefetchAPIs = useCallback(() => {
    // Prefetch common API endpoints
    if (typeof window !== 'undefined') {
      const apiRoutes = [
        '/api/articles',
        '/api/articles/all',
      ]
      
      apiRoutes.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        link.as = 'fetch'
        document.head.appendChild(link)
      })
    }
  }, [])

  // Prefetch homepage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      router.prefetch('/')
      prefetchCategories()
      
      // Use requestIdleCallback for non-critical prefetching
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          prefetchAPIs()
        })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(prefetchAPIs, 2000)
      }
    } catch {
      // Silently fail during SSR
      console.debug('Prefetch failed during SSR')
    }
  }, [router, prefetchCategories, prefetchAPIs])

  // Prefetch based on current page
  useEffect(() => {
    if (!pathname) return

    // If on category page, prefetch other categories
    if (pathname.startsWith('/news') || 
        pathname.startsWith('/entertainment') ||
        pathname.startsWith('/sports') ||
        pathname.startsWith('/health-fitness') ||
        pathname.startsWith('/editorial') ||
        pathname.startsWith('/technology') ||
        pathname.startsWith('/automobiles')) {
      prefetchCategories()
    }

    // If on article page, prefetch category page
    if (pathname.includes('/') && pathname.split('/').length === 3) {
      const parts = pathname.split('/')
      if (parts[1] && parts[1] !== 'author' && parts[1] !== 'admin') {
        router.prefetch(`/${parts[1]}`)
      }
    }

    // If on author page, prefetch other common pages
    if (pathname.startsWith('/author/')) {
      router.prefetch('/')
      prefetchCategories()
    }
  }, [pathname, router, prefetchCategories])

  return null
}
