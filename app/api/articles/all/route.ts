import { NextRequest, NextResponse } from 'next/server'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { formatDateShort } from '@/lib/date-utils'
import { createCachedResponse } from '@/lib/cache-headers'
import { queryCache } from '@/lib/query-cache'

// Production-level caching: 60s cache, 5min stale-while-revalidate
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const excludeSlug = searchParams.get('excludeSlug') // Exclude current article
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)

    // Check cache first
    const cacheKey = `articles:all:${excludeSlug || 'none'}:${page}:${limit}`
    
    interface ArticleListItem {
      id: string
      title: string
      subtitle?: string
      mainImage: string
      publishedDate: string
      authorName: string
      slug: string
      category: string
    }

    interface ArticlesResponse {
      articles: ArticleListItem[]
      pagination: { page: number; limit: number; total: number; hasMore: boolean }
    }
    
    const cachedResult = queryCache.get<ArticlesResponse>(cacheKey)

    if (cachedResult) {
      return createCachedResponse(cachedResult, 60, 300)
    }

    // Current date for filtering out future-dated articles
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const query: { 
      status: string
      publishedDate: { $lte: Date }
      slug?: { $ne: string }
    } = {
      status: 'published',
      publishedDate: { $lte: currentDate },
    }
    
    // Exclude current article if provided
    if (excludeSlug) {
      query.slug = { $ne: excludeSlug }
    }

    const skip = (page - 1) * limit

    const [articles, totalArticles] = await Promise.all([
      Article.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title subtitle mainImage publishedDate authorName slug category createdAt')
        .lean(),
      Article.countDocuments(query)
    ])

    interface ArticleDoc {
      _id: { toString: () => string }
      title: string
      subtitle?: string
      mainImage?: { url: string }
      publishedDate: Date
      authorName?: string
      slug: string
      category: string
      createdAt: Date
    }

    const articlesData = (articles as ArticleDoc[]).map((article) => ({
      id: article._id.toString(),
      title: article.title,
      subtitle: article.subtitle,
      mainImage: article.mainImage?.url || '',
      publishedDate: article.publishedDate
        ? formatDateShort(article.publishedDate)
        : '',
      authorName: article.authorName || 'Unknown',
      slug: article.slug,
      category: article.category,
    }))

    const hasMore = skip + articles.length < totalArticles

    const result = {
      articles: articlesData,
      pagination: {
        page,
        limit,
        total: totalArticles,
        hasMore,
      },
    }

    // Cache the result for 60 seconds
    queryCache.set(cacheKey, result, 60 * 1000)

    // Return cached response with production-level cache headers
    return createCachedResponse(result, 60, 300) // 60s cache, 5min stale-while-revalidate
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
