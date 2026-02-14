'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/entertainment', label: 'Entertainment' },
  { href: '/sports', label: 'Sports' },
  { href: '/health-fitness', label: 'Health & Fitness' },
  { href: '/editorial', label: 'Editorial' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-orange-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center items-center gap-6 md:gap-8 py-3.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium text-sm md:text-base transition-colors duration-200 relative pb-1 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-900 hover:text-orange-600'
                }`}
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
