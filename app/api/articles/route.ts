import { NextRequest, NextResponse } from 'next/server'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { formatDateShort } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')

    const query: { status: string; category?: string } = {
      status: 'published', // Only published articles
    }
    
    if (category) {
      query.category = category
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
      createdAt: Date
    }

    return NextResponse.json({
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
        createdAt: article.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
