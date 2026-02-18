import { requireAdmin } from '@/lib/admin-auth'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Publisher from '@/models/Publisher'
import ArticlesTable from '@/components/admin/ArticlesTable'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'
import AuthorFilter from '@/components/admin/AuthorFilter'
import PublisherFilter from '@/components/admin/PublisherFilter'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

interface ArticleWithAuthor {
  _id: { toString: () => string }
  title: string
  subtitle?: string
  content: string[]
  author: {
    _id: string
    name: string
    email: string
  } | string | { _bsontype?: string; toString: () => string }
  authorName?: string
  publishedDate: Date
  mainImage: {
    url: string
    public_id: string
    alt?: string
  }
  subImages: Array<{
    url: string
    public_id: string
    alt?: string
    order: number
  }>
  status: 'draft' | 'published'
  category: string
  slug: string
  views?: number
  isTopStory?: boolean
  isMiniTopStory?: boolean
  isTrending?: boolean
  createdAt: Date
  updatedAt: Date
}

export default async function ManageArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ author?: string; publisher?: string }>
}) {
  await requireAdmin()
  await connectDB()

  const params = await searchParams
  const authorFilter = params.author
  const publisherFilter = params.publisher

  // Build query with optional author and publisher filters
  const query: { authorName?: string; publisher?: mongoose.Types.ObjectId } = {}
  if (authorFilter && authorFilter !== 'all') {
    query.authorName = authorFilter
  }
  if (publisherFilter && publisherFilter !== 'all') {
    query.publisher = new mongoose.Types.ObjectId(publisherFilter)
  }

  // Get all unique authors and publishers for filter dropdowns
  const [allAuthors, allPublishers] = await Promise.all([
    Article.distinct('authorName', {
      authorName: { $exists: true, $ne: '' }
    }).sort(),
    Publisher.find()
      .select('_id name')
      .sort({ name: 1 })
      .lean()
  ])

  // Optimized: Only select needed fields, no populate (authorName is already stored)
  // Parallel execution with Promise.all for better performance
  const articles = await Article.find(query)
    .select('title author authorName publishedDate createdAt status category isTopStory isMiniTopStory isTrending publisher')
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean() as unknown as ArticleWithAuthor[]

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Articles</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/articles/new"
                prefetch={true}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                New Article
              </Link>
              <Link
                href="/admin/dashboard"
                prefetch={true}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Filters - Column wise */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AuthorFilter authors={allAuthors} selectedAuthor={authorFilter || 'all'} />
          <PublisherFilter 
            publishers={allPublishers.map(p => ({ 
              id: p._id.toString(), 
              name: p.name 
            }))} 
            selectedPublisher={publisherFilter || 'all'} 
          />
        </div>

        <ArticlesTable articles={articles.map((article) => {
          // Optimized: Use stored authorName directly (no populate needed)
          const authorName = article.authorName || 'Unknown'
          const publishedDate = article.publishedDate 
            ? new Date(article.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'N/A'
          
          return {
            id: article._id.toString(),
            title: article.title,
            author: authorName,
            publishedDate,
            createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
            isTopStory: article.isTopStory || false,
            isMiniTopStory: article.isMiniTopStory || false,
            isTrending: article.isTrending || false,
            status: article.status,
            category: article.category,
            type: article.category,
          }
        })} />
      </div>
    </>
  )
}
