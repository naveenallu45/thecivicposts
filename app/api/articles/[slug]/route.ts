import { NextRequest, NextResponse } from 'next/server'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { formatDateShort } from '@/lib/date-utils'
import { createCachedResponse } from '@/lib/cache-headers'
import { queryCache } from '@/lib/query-cache'

// Production-level caching: 120s cache for individual articles, 10min stale-while-revalidate
export const revalidate = 120
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params
    
    // Check cache first
    const cacheKey = `article:single:${slug}`
    interface ArticleResponse {
      article: {
        id: string
        title: string
        subtitle?: string
        content: string[]
        authorName: string
        publishedDate: string
        mainImage: { url: string; public_id: string; alt?: string }
        miniImage?: { url: string; public_id: string; alt?: string }
        youtubeLink?: string
        subImages: Array<{ url: string; public_id: string; alt?: string; order: number }>
        category: string
        views: number
      }
    }
    const cachedResult = queryCache.get<ArticleResponse>(cacheKey)
    
    if (cachedResult) {
      return createCachedResponse(cachedResult, 120, 600)
    }
    
    // Current date for filtering out future-dated articles
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    // Optimized: Removed populate() since authorName is stored in document
    const article = await Article.findOne({ 
      slug, 
      status: 'published',
      publishedDate: { $lte: currentDate } // Only show articles published today or earlier
    })
      .lean()

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Optimized: Use updateOne instead of findByIdAndUpdate for better performance
    // This is a fire-and-forget operation, doesn't need to wait for response
    Article.updateOne({ _id: article._id }, { $inc: { views: 1 } }).catch((err) => {
      console.error('Error incrementing views:', err)
      // Don't throw - view count is not critical
    })

    const result = {
      article: {
        id: article._id.toString(),
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        authorName: article.authorName || 'Unknown',
        publishedDate: article.publishedDate
          ? formatDateShort(article.publishedDate)
          : '',
        mainImage: article.mainImage,
        miniImage: article.miniImage,
        youtubeLink: article.youtubeLink,
        subImages: article.subImages || [],
        category: article.category,
        views: article.views || 0,
      },
    }

    // Cache the result for 120 seconds
    queryCache.set(cacheKey, result, 120 * 1000)

    // Return cached response with production-level cache headers
    return createCachedResponse(result, 120, 600) // 120s cache, 10min stale-while-revalidate
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
