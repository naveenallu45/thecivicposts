// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import CategoryInfiniteScroll from '@/components/CategoryInfiniteScroll'
import type { ArticleListItem } from '@/lib/article-types'
import { formatDateShort } from '@/lib/date-utils'
import type { Metadata } from 'next'

// ISR: Revalidate every 30 seconds for faster updates
export const revalidate = 30

// Production-level caching: Use static generation with revalidation
export const dynamic = 'force-static'

const ARTICLES_PER_PAGE = 10

const baseUrl = 'https://www.thecivicposts.com'

export const metadata: Metadata = {
  title: 'News - Latest News Articles | The Civic Posts',
  description: 'Stay updated with the latest news articles, breaking news, and current events. Read in-depth news stories and stay informed.',
  keywords: ['news', 'latest news', 'breaking news', 'current events', 'news articles', 'daily news'],
  alternates: {
    canonical: `${baseUrl}/news`,
  },
  openGraph: {
    title: 'News - Latest News Articles | The Civic Posts',
    description: 'Stay updated with the latest news articles, breaking news, and current events.',
    url: `${baseUrl}/news`,
    siteName: 'The Civic Posts',
    type: 'website',
  },
}

export default async function NewsPage() {
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Try to connect to database, but handle errors gracefully during build
  let articles: ArticleListItem[] = []
  let totalArticles = 0

  try {
    await connectDB()

    // Optimized query with indexes - should be instant
    const results = await Promise.all([
      Article.find({ 
        status: 'published',
        category: 'news',
        publishedDate: { $lte: currentDate } // Only show articles published today or earlier
      })
        .sort({ createdAt: -1 })
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

    articles = results[0]
    totalArticles = results[1]
  } catch (error) {
    console.error('Database connection failed during build for news page:', error)
    // Return empty state to allow build to complete
  }

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

  return (
    <CategoryInfiniteScroll
      initialArticles={articlesData}
      category="news"
      totalArticles={totalArticles}
      heading="News"
    />
  )
}
