'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Smooth scroll behavior component
 * Ensures smooth scrolling throughout the app
 */
export default function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Smooth scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }, [pathname])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // Add smooth scroll behavior to html element
    document.documentElement.style.scrollBehavior = 'smooth'
    
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.scrollBehavior = 'auto'
      }
    }
  }, [])

  return null
}
