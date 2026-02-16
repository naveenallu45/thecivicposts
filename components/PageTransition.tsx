'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Smooth page transition wrapper
 * Keeps previous category content visible until next category is ready
 * Eliminates white screen, gaps, and visible delays during navigation
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousPathname = useRef(pathname)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If pathname changed, start transition
    if (previousPathname.current !== pathname) {
      setIsTransitioning(true)
      previousPathname.current = pathname
      
      // Use requestAnimationFrame to ensure smooth transition
      // This allows React to start rendering new content before we swap
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Update to new content
          setDisplayChildren(children)
          
          // Small delay then fade in new content
          timeoutRef.current = setTimeout(() => {
            setIsTransitioning(false)
          }, 50)
        })
      })
    } else {
      // Same pathname, update immediately
      setDisplayChildren(children)
      setIsTransitioning(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, children])

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#f9fafb', // Match bg-gray-50
      }}
    >
      {/* Previous content - stays visible until new content is ready */}
      <div 
        className={`transition-opacity duration-150 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          minHeight: '100vh',
          zIndex: isTransitioning ? 1 : 0,
        }}
      >
        {displayChildren}
      </div>
      
      {/* New content - fades in when ready */}
      <div 
        className={`transition-opacity duration-150 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          position: 'relative',
          zIndex: isTransitioning ? 0 : 2,
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </div>
  )
}
