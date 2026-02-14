import { NextRequest, NextResponse } from 'next/server'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { formatDateShort } from '@/lib/date-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params
    // Optimized: Removed populate() since authorName is stored in document
    const article = await Article.findOne({ slug, status: 'published' })
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

    return NextResponse.json({
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
        subImages: article.subImages || [],
        category: article.category,
        views: article.views || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
