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
  title: 'Health & Fitness - Health Tips & Fitness Articles | The Civic Posts',
  description: 'Discover health tips, fitness advice, wellness articles, and lifestyle guides. Stay healthy and fit with expert advice.',
  keywords: ['health', 'fitness', 'wellness', 'health tips', 'fitness advice', 'lifestyle'],
  alternates: {
    canonical: `${baseUrl}/health-fitness`,
  },
  openGraph: {
    title: 'Health & Fitness - Health Tips & Fitness Articles | The Civic Posts',
    description: 'Discover health tips, fitness advice, and wellness articles.',
    url: `${baseUrl}/health-fitness`,
    siteName: 'The Civic Posts',
    type: 'website',
  },
}

export default async function HealthFitnessPage() {
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  let articles: ArticleListItem[] = []
  let totalArticles = 0

  try {
    await connectDB()

    const results = await Promise.all([
      Article.find({ 
        status: 'published',
        category: 'health-fitness',
        publishedDate: { $lte: currentDate }
      })
        .sort({ createdAt: -1 })
        .limit(ARTICLES_PER_PAGE)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean() as Promise<ArticleListItem[]>,
      Article.countDocuments({ 
        status: 'published',
        category: 'health-fitness',
        publishedDate: { $lte: currentDate }
      })
    ])

    articles = results[0]
    totalArticles = results[1]
  } catch (error) {
    console.error('Database connection failed during build for health-fitness page:', error)
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
      category="health-fitness"
      totalArticles={totalArticles}
      heading="Health & Life Style"
    />
  )
}
