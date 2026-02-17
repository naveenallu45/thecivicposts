// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import CategoryInfiniteScroll from '@/components/CategoryInfiniteScroll'
import type { ArticleListItem } from '@/lib/article-types'
import { formatDateShort } from '@/lib/date-utils'

// ISR: Revalidate every 30 seconds for faster updates
export const revalidate = 30

// Production-level caching: Use static generation with revalidation
export const dynamic = 'force-static'

const ARTICLES_PER_PAGE = 10

export default async function TechnologyPage() {
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Try to connect to database, but handle errors gracefully during build
  let articles: ArticleListItem[] = []
  let totalArticles = 0

  try {
    await connectDB()

    const results = await Promise.all([
      Article.find({ 
        status: 'published',
        category: 'technology',
        publishedDate: { $lte: currentDate }
      })
        .sort({ createdAt: -1 })
        .limit(ARTICLES_PER_PAGE)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean()
        .exec() as Promise<ArticleListItem[]>,
      Article.countDocuments({ 
        status: 'published',
        category: 'technology',
        publishedDate: { $lte: currentDate }
      })
        .exec()
    ])

    articles = results[0] || []
    totalArticles = results[1] || 0
  } catch (error) {
    // Log error but don't throw - allow build to complete with empty state
    console.error('Database connection failed during build for technology page:', error)
    // Return empty arrays to allow build to complete successfully
    articles = []
    totalArticles = 0
  }

  const articlesData = (articles || []).map((article) => ({
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

  return (
    <CategoryInfiniteScroll
      initialArticles={articlesData}
      category="technology"
      totalArticles={totalArticles}
      heading="Technology"
    />
  )
}
