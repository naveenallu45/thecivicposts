/**
 * Client-side cache for category articles
 * Ensures instant loading when navigating between categories
 */

interface ArticleCacheItem {
  id: string
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  createdAt: Date
}

interface CachedArticles {
  articles: ArticleCacheItem[]
  timestamp: number
  category: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CachedArticles>()

export function getCachedArticles(category: string, page: number = 1): ArticleCacheItem[] | null {
  const key = `${category}-${page}`
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.articles
  }
  
  return null
}

export function setCachedArticles(category: string, page: number, articles: ArticleCacheItem[]): void {
  const key = `${category}-${page}`
  cache.set(key, {
    articles,
    timestamp: Date.now(),
    category,
  })
}

export function preloadCategoryArticles(category: string): Promise<void> {
  // Only run on client side
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return Promise.resolve()
  }

  return fetch(`/api/articles?category=${category}&page=1&limit=10`, {
    method: 'GET',
    cache: 'force-cache',
  })
    .then(res => res.json())
    .then(data => {
      if (data.articles) {
        setCachedArticles(category, 1, data.articles)
      }
    })
    .catch(() => {
      // Silently fail
    })
}

export function preloadAllCategories(): void {
  // Only run on client side
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return
  }

  const categories = ['news', 'entertainment', 'sports', 'health-fitness', 'editorial', 'technology', 'automobiles']
  
  categories.forEach(category => {
    preloadCategoryArticles(category)
  })
}
