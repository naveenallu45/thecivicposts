// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import ArticlesRow from '@/components/ArticlesRow'
import Pagination from '@/components/Pagination'
import type { ArticleListItem } from '@/lib/article-types'
import { formatDateShort } from '@/lib/date-utils'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

const ARTICLES_PER_PAGE = 10

export default async function HealthFitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await connectDB()

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const skip = (currentPage - 1) * ARTICLES_PER_PAGE

  const [articles, totalArticles] = await Promise.all([
    Article.find({ 
      status: 'published',
      category: 'health-fitness'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ARTICLES_PER_PAGE)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean() as Promise<ArticleListItem[]>,
    // Use countDocuments - estimatedDocumentCount doesn't support queries
    // For better performance, ensure indexes are used (already indexed)
    Article.countDocuments({ 
      status: 'published',
      category: 'health-fitness'
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

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-[92%] lg:w-[85%] mx-auto py-12">
        <ArticlesRow articles={articlesData} heading="Health & Fitness" />
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages}
        />
      </div>
    </main>
  )
}
