/**
 * Production-level MongoDB query caching utilities
 * Implements server-side caching for frequently accessed queries
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private readonly DEFAULT_TTL = 60 * 1000 // 60 seconds default

  /**
   * Get cached query result
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
   * Set cached query result
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Delete cached entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache or cache matching pattern
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // Clear entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Generate cache key for article queries
   */
  static articleKey(category?: string, page?: number, limit?: number): string {
    return `article:${category || 'all'}:${page || 1}:${limit || 12}`
  }

  /**
   * Generate cache key for single article
   */
  static singleArticleKey(slug: string): string {
    return `article:single:${slug}`
  }

  /**
   * Generate cache key for author articles
   */
  static authorKey(slug: string, page?: number, limit?: number): string {
    return `author:${slug}:${page || 1}:${limit || 10}`
  }
}

// Export singleton instance
export const queryCache = new QueryCache()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup()
  }, 5 * 60 * 1000)
}
