import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import LogoutButton from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await requireAdmin()

  await connectDB()
  const [articlesCount, publishedCount, draftCount, authorsCount] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' }),
    Author.countDocuments(),
  ])

  const recentArticles = await Article.find()
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-700 font-serif">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/articles/new"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-md"
              >
                New Article
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Articles</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{articlesCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Published</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{publishedCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{draftCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Authors</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{authorsCount}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/admin/articles"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-orange-500 rounded-full group-hover:bg-orange-600 transition-colors"></div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Manage Articles</h3>
              </div>
              <p className="text-gray-600 ml-4">View, edit, and publish articles</p>
            </Link>
            <Link
              href="/admin/authors"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-orange-500 rounded-full group-hover:bg-orange-600 transition-colors"></div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Manage Authors</h3>
              </div>
              <p className="text-gray-600 ml-4">Add and manage article authors</p>
            </Link>
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-500">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
              <h2 className="text-xl font-semibold text-orange-700">Recent Articles</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentArticles.map((article: {
                _id: { toString: () => string }
                title: string
                author?: { name?: string } | string | null | unknown
                authorName?: string
                category: string
                status: string
              }) => (
                <Link
                  key={article._id.toString()}
                  href={`/admin/articles/${article._id}`}
                  className="block px-6 py-4 hover:bg-orange-50 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {typeof article.author === 'object' && article.author !== null && 'name' in article.author 
                          ? (article.author as { name?: string }).name || article.authorName || 'Unknown'
                          : article.authorName || 'Unknown'} • <span className="text-orange-600 font-medium">{article.category}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
