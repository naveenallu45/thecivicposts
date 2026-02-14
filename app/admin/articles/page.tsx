import { requireAdmin } from '@/lib/admin-auth'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import ArticlesTable from '@/components/admin/ArticlesTable'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

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
  isLatest?: boolean
  isTrending?: boolean
  createdAt: Date
  updatedAt: Date
}

export default async function ManageArticlesPage() {
  await requireAdmin()
  await connectDB()

  // For scalability: Limit to most recent 1000 articles
  // MUI DataGrid handles pagination client-side, but we limit server-side for performance
  // TODO: Implement server-side pagination for better scalability with 100k+ articles
  const articles = await Article.find()
    .populate('author', 'name email')
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
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                New Article
              </Link>
              <Link
                href="/admin/dashboard"
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
        <ArticlesTable articles={articles.map((article) => ({
          id: article._id.toString(),
          title: article.title,
          author: typeof article.author === 'object' && article.author !== null && 'name' in article.author 
            ? (article.author as { name?: string }).name || article.authorName || 'Unknown'
            : article.authorName || 'Unknown',
          publishedDate: article.publishedDate ? new Date(article.publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : 'N/A',
          createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
          isTopStory: article.isTopStory || false,
          isMiniTopStory: article.isMiniTopStory || false,
          isLatest: article.isLatest || false,
          isTrending: article.isTrending || false,
          status: article.status,
          category: article.category,
          type: article.category,
        }))} />
      </div>
    </>
  )
}
