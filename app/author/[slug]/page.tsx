// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import InfiniteScrollArticles from '@/components/InfiniteScrollArticles'
import type { ArticleListItem } from '@/lib/article-types'
import { formatDateShort } from '@/lib/date-utils'
import { generateAuthorSlug } from '@/lib/author-utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

// Production-level caching: Use static generation with revalidation
export const dynamic = 'force-static'

const ARTICLES_PER_PAGE = 10

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  await connectDB()
  
  const { slug } = await params
  
  // Try to find the author name by matching slug
  const allAuthors = await Article.distinct('authorName', { 
    status: 'published',
    authorName: { $exists: true, $ne: '' }
  })
  
  const authorName = allAuthors.find(name => 
    name && generateAuthorSlug(name) === slug
  ) || 'Unknown Author'

  return {
    title: `Articles by ${authorName} - The Civic Posts`,
    description: `Read all articles written by ${authorName} on The Civic Posts.`,
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await connectDB()
  
  const { slug } = await params

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
    notFound()
  }

  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Load initial 10 articles
  const [articles, totalArticles] = await Promise.all([
    Article.find({ 
      status: 'published',
      authorName: authorName,
      publishedDate: { $lte: currentDate } // Only show articles published today or earlier
    })
      .sort({ createdAt: -1 })
      .limit(ARTICLES_PER_PAGE)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean() as Promise<ArticleListItem[]>,
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-[92%] lg:w-[85%] mx-auto py-6 md:py-12">
        <InfiniteScrollArticles
          initialArticles={articlesData}
          authorSlug={slug}
          totalArticles={totalArticles}
          authorName={authorName}
        />
      </div>
    </main>
  )
}
