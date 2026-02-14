'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function ArticleNotFound() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Extract category from pathname and redirect instantly
    const pathParts = pathname?.split('/').filter(Boolean) || []
    const category = pathParts[0] || 'news'
    
    // Instant redirect to category page
    router.replace(`/${category}`)
  }, [pathname, router])

  // Show nothing while redirecting
  return null
}
