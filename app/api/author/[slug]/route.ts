// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { formatDateShort } from '@/lib/date-utils'
import { generateAuthorSlug } from '@/lib/author-utils'
import { NextRequest, NextResponse } from 'next/server'
import { createCachedResponse } from '@/lib/cache-headers'
import { queryCache } from '@/lib/query-cache'

// Production-level caching: 60s cache, 5min stale-while-revalidate
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Check cache first
    const cacheKey = `author:${slug}:${page}:${limit}`
    
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

    // Get all unique author names
    const allAuthors = await Article.distinct('authorName', { 
      status: 'published',
      authorName: { $exists: true, $ne: '' }
    })
    
    // Find the author name that matches the slug
    const authorName = allAuthors.find(name => 
      name && generateAuthorSlug(name) === slug
    )

    if (!authorName) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    const skip = (page - 1) * limit

    // Current date for filtering out future-dated articles
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const [articles, totalArticles] = await Promise.all([
      Article.find({ 
        status: 'published',
        authorName: authorName,
        publishedDate: { $lte: currentDate } // Only show articles published today or earlier
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      Article.countDocuments({ 
        status: 'published',
        authorName: authorName,
        publishedDate: { $lte: currentDate }
      })
    ])

    const articlesData = articles.map((article) => ({
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
    console.error('Error fetching author articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
