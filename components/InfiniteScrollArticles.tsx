'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ArticleCard from './ArticleCard'

interface Article {
  id: string
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

interface InfiniteScrollArticlesProps {
  initialArticles: Article[]
  authorSlug: string
  totalArticles: number
  authorName: string
}

export default function InfiniteScrollArticles({
  initialArticles,
  authorSlug,
  totalArticles,
  authorName,
}: InfiniteScrollArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArticles.length < totalArticles)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMoreArticles = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const nextPage = page + 1
      const response = await fetch(`/api/author/${authorSlug}?page=${nextPage}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to load articles')
      }

      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        setArticles((prev) => [...prev, ...data.articles])
        setPage(nextPage)
        setHasMore(data.pagination.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more articles:', err)
      setError('Failed to load more articles. Please try again.')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [page, hasMore, authorSlug])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Trigger when the observed element (7th article) becomes visible
        if (entries[0].isIntersecting && hasMore && !loading && !loadingRef.current) {
          loadMoreArticles()
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before the element is visible
        threshold: 0.1,
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget && hasMore) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMoreArticles, articles.length])

  // Observe the 7th article (index 6) from the last complete batch of 10
  // Example: With 10 articles, observe index 6 (7th article = 3 before end)
  //          With 20 articles, observe index 16 (17th article = 7th from last batch)
  const getObservedIndex = () => {
    if (articles.length < 7) return -1 // Not enough articles yet
    
    // Calculate the last complete batch of 10
    const batchesLoaded = Math.floor(articles.length / 10)
    
    // Observe the 7th article (index 6) from the last complete batch
    // Formula: (batchesLoaded - 1) * 10 + 6
    // For 1 batch (10 articles): (1-1)*10 + 6 = 6 ✓
    // For 2 batches (20 articles): (2-1)*10 + 6 = 16 ✓
    // For 3 batches (30 articles): (3-1)*10 + 6 = 26 ✓
    return (batchesLoaded - 1) * 10 + 6
  }

  const observedIndex = getObservedIndex()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-merriweather">
          Articles by {authorName}
        </h1>
        <p className="text-gray-600">
          {totalArticles} {totalArticles === 1 ? 'article' : 'articles'} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-3 md:mt-6">
        {articles.map((article, index) => (
          <div
            key={`${article.id}-${index}`}
            ref={index === observedIndex && hasMore && observedIndex >= 0 ? observerTarget : null}
            data-article-id={`${article.category}/${article.slug}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ArticleCard
              title={article.title}
              subtitle={article.subtitle}
              mainImage={article.mainImage}
              publishedDate={article.publishedDate}
              authorName={article.authorName}
              slug={article.slug}
              category={article.category}
            />
          </div>
        ))}
      </div>

      {/* Loading happens silently in background - no visible indicator */}

      {error && (
        <div className="flex justify-center items-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadMoreArticles}
            className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-600 text-sm">You&apos;ve reached the end</p>
        </div>
      )}
    </div>
  )
}
