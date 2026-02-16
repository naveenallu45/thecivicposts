// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import ArticlesRow from '@/components/ArticlesRow'
import Pagination from '@/components/Pagination'
import type { ArticleListItem } from '@/lib/article-types'
import { formatDateShort } from '@/lib/date-utils'

// ISR: Revalidate every 30 seconds for faster updates
export const revalidate = 30

// Production-level caching: Use static generation with revalidation
export const dynamic = 'force-static'

const ARTICLES_PER_PAGE = 10

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  // Connect to DB (cached connection - instant)
  await connectDB()

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const skip = (currentPage - 1) * ARTICLES_PER_PAGE

  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Optimized query with indexes - should be instant
  const [articles, totalArticles] = await Promise.all([
    Article.find({ 
      status: 'published',
      category: 'news',
      publishedDate: { $lte: currentDate } // Only show articles published today or earlier
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ARTICLES_PER_PAGE)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean()
      .exec() as Promise<ArticleListItem[]>,
    // Use countDocuments - estimatedDocumentCount doesn't support queries
    // For better performance, ensure indexes are used (already indexed)
    Article.countDocuments({ 
      status: 'published',
      category: 'news',
      publishedDate: { $lte: currentDate }
    })
      .exec()
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

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE)

  return (
    <div className="w-[92%] lg:w-[85%] mx-auto py-6 md:py-12">
      <ArticlesRow articles={articlesData} heading="News" />
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages}
      />
    </div>
  )
}
