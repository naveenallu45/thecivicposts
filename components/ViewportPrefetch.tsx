'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { generateAuthorSlug } from '@/lib/author-utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

interface ViewportPrefetchProps {
  articles: Array<{
    slug: string
    category: string
    authorName?: string
    mainImage?: string
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
                
                // Preload article image for instant display
                if (article.mainImage && article.mainImage.trim()) {
                  try {
                    const imageUrl = getOptimizedImageUrl(article.mainImage, 1200, 'auto:best')
                    const link = document.createElement('link')
                    link.rel = 'preload'
                    link.as = 'image'
                    link.href = imageUrl
                    link.setAttribute('fetchpriority', 'high')
                    document.head.appendChild(link)
                    
                    // Also preload the actual image to browser cache
                    const img = new window.Image()
                    img.src = imageUrl
                  } catch {}
                }
                
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
