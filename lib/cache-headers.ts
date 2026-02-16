import { NextResponse } from 'next/server'

/**
 * Production-level cache headers for API routes
 * Implements stale-while-revalidate pattern for optimal performance
 */

export function getCacheHeaders(maxAge: number = 60, staleWhileRevalidate: number = 300) {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`,
    'CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}

export function getLongCacheHeaders(maxAge: number = 300, staleWhileRevalidate: number = 600) {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`,
    'CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}

export function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

/**
 * Creates a cached response with proper headers
 */
export function createCachedResponse<T = unknown>(data: T, maxAge: number = 60, staleWhileRevalidate: number = 300) {
  return NextResponse.json(data, {
    headers: getCacheHeaders(maxAge, staleWhileRevalidate),
  })
}
