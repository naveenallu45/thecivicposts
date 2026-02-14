/**
 * Simple in-memory cache for frequently accessed articles
 * For production, consider using Redis or a dedicated caching service
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Default TTL: 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache()

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}

/**
 * Cache keys
 */
export const CacheKeys = {
  article: (category: string, slug: string) => `article:${category}:${slug}`,
  articleList: (category?: string, page?: number) => 
    category ? `articles:${category}:${page || 1}` : `articles:all:${page || 1}`,
  homeArticles: () => 'articles:home',
} as const
