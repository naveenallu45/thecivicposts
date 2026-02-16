'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Auto-scroll component for article pages
 * Smoothly scrolls from middle to top when article page loads
 * Provides a smooth user experience when opening articles
 */
export default function ArticleAutoScroll() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if we're on an article page (pattern: /category/slug)
    const articlePagePattern = /^\/[^/]+\/[^/]+$/
    const isArticlePage = articlePagePattern.test(pathname || '')

    if (isArticlePage) {
      // Small delay to ensure page content is loaded and rendered
      const scrollTimer = setTimeout(() => {
        // Get current scroll position
        const currentScrollY = window.scrollY || window.pageYOffset
        
        // Smooth scroll to top (from middle or wherever user is)
        // This provides a smooth experience when opening articles
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      }, 150) // Small delay for better UX - allows content to render first

      return () => {
        clearTimeout(scrollTimer)
      }
    }
  }, [pathname])

  return null
}
