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
    const category = searchParams.get('category')
    const excludeSlug = searchParams.get('excludeSlug') // Exclude specific article
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')

    // Check cache first
    const cacheKey = `article:${category || 'all'}:${excludeSlug || 'none'}:${page}:${limit}`
    
    interface ArticleListItem {
      id: string
      title: string
      subtitle?: string
      mainImage: string
      publishedDate: string
      authorName: string
      slug: string
      createdAt: Date
    }

    interface ArticlesResponse {
      articles: ArticleListItem[]
      pagination: { page: number; limit: number; total: number; pages: number }
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
      category?: string
      publishedDate?: { $lte: Date }
      slug?: { $ne: string }
    } = {
      status: 'published', // Only published articles
      publishedDate: { $lte: currentDate }, // Only show articles published today or earlier
    }
    
    if (category) {
      query.category = category
    }
    
    // Exclude specific article if provided
    if (excludeSlug) {
      query.slug = { $ne: excludeSlug }
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title subtitle mainImage publishedDate authorName slug createdAt')
      .lean()

    // Use countDocuments - estimatedDocumentCount doesn't support queries
    // For better performance, ensure indexes are used (already indexed)
    const total = await Article.countDocuments(query)

    interface ArticleDoc {
      _id: { toString: () => string }
      title: string
      subtitle?: string
      mainImage?: { url: string }
      publishedDate: Date
      author?: { name?: string } | string | null
      authorName?: string
      slug: string
      category: string
      createdAt: Date
    }

    const result = {
      articles: (articles as ArticleDoc[]).map((article) => ({
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
        createdAt: article.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
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
