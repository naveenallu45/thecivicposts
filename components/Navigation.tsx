'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/entertainment', label: 'Entertainment' },
  { href: '/sports', label: 'Sports' },
  { href: '/health-fitness', label: 'Health & Life Style' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/technology', label: 'Technology' },
  { href: '/automobiles', label: 'Automobiles' },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <nav className="bg-orange-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center items-center gap-6 md:gap-8 py-3.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  // Start transition immediately for instant feel
                  startTransition(() => {
                    router.prefetch(item.href)
                  })
                }}
                onMouseEnter={() => {
                  // Aggressive prefetch on hover for instant navigation
                  router.prefetch(item.href)
                  
                  // Also prefetch the API data immediately
                  if (item.href !== '/' && typeof window !== 'undefined') {
                    const categoryName = item.href.replace('/', '')
                    const apiUrl = `/api/articles?category=${categoryName}&page=1&limit=10`
                    
                    // Prefetch API link
                    const link = document.createElement('link')
                    link.rel = 'prefetch'
                    link.href = apiUrl
                    link.as = 'fetch'
                    link.crossOrigin = 'anonymous'
                    document.head.appendChild(link)
                    
                    // Fetch immediately with highest priority
                    fetch(apiUrl, { 
                      method: 'GET', 
                      cache: 'force-cache',
                      priority: 'high'
                    }).catch(() => {
                      // Silently fail
                    })
                  }
                }}
                className={`font-semibold text-sm md:text-base transition-colors duration-200 relative pb-1 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-900 hover:text-orange-600'
                } ${isPending ? 'opacity-70' : ''}`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
