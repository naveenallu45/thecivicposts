// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireAuthor } from '@/lib/author-auth'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import AuthorLogoutButton from '@/components/author/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AuthorDashboard() {
  const session = await requireAuthor()

  await connectDB()
  
  // Get author's ObjectId to filter articles
  const author = await (await import('@/models/Author')).default.findOne({ email: session.email })
  if (!author) {
    throw new Error('Author not found')
  }

  const [articlesCount, publishedCount, draftCount] = await Promise.all([
    Article.countDocuments({ author: author._id }),
    Article.countDocuments({ author: author._id, status: 'published' }),
    Article.countDocuments({ author: author._id, status: 'draft' }),
  ])

  // Get recent articles by this author only
  const recentArticles = await Article.find({ author: author._id })
    .select('title authorName category status createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-orange-700 font-serif">Author Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {session.authorName}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/author/articles/new"
                prefetch={true}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-md"
              >
                New Article
              </Link>
              <AuthorLogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats and View/Manage Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">My Articles</h3>
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
            <Link
              href="/author/articles"
              prefetch={true}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 hover:border-blue-600 group"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">View/Manage Articles</h3>
              <p className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 transition-colors mt-2">Manage All</p>
            </Link>
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
            </div>
            {recentArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No articles yet. Create your first article!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentArticles.map((article: {
                      _id: { toString: () => string }
                      title: string
                      category: string
                      status: string
                      createdAt: Date
                    }) => (
                      <tr key={article._id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              article.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
