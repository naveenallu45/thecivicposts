'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { generateAuthorSlug } from '@/lib/author-utils'

interface ViewportPrefetchProps {
  articles: Array<{
    slug: string
    category: string
    authorName?: string
  }>
}

/**
 * Prefetches articles when they enter the viewport
 * Production-level optimization for instant navigation
 */
export default function ViewportPrefetch({ articles }: ViewportPrefetchProps) {
  const router = useRouter()
  const prefetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const articleId = entry.target.getAttribute('data-article-id')
            if (articleId && !prefetchedRef.current.has(articleId)) {
              const article = articles.find((a) => `${a.category}/${a.slug}` === articleId)
              if (article) {
                // Prefetch article page
                router.prefetch(`/${article.category}/${article.slug}`)
                
                // Prefetch author page if available
                if (article.authorName) {
                  router.prefetch(`/author/${generateAuthorSlug(article.authorName)}`)
                }
                
                prefetchedRef.current.add(articleId)
              }
            }
          }
        })
      },
      {
        rootMargin: '200px', // Start prefetching 200px before article enters viewport
        threshold: 0.1,
      }
    )

    // Observe all article cards
    const articleElements = document.querySelectorAll('[data-article-id]')
    articleElements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [articles, router])

  return null
}
