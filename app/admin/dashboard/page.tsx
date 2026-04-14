// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import VisitorEvent from '@/models/VisitorEvent'
import LogoutButton from '@/components/admin/LogoutButton'
import PublisherStatistics from '@/components/admin/PublisherStatistics'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await requireAdmin()

  interface RecentArticle {
    _id: { toString: () => string }
    title: string
    authorName?: string
    category: string
    status: string
    createdAt: Date
  }

  let articlesCount = 0
  let publishedCount = 0
  let draftCount = 0
  let authorsCount = 0
  let publishersCount = 0
  let visitorsLast24h = 0
  let visitorsLast7d = 0
  let visitorsLast30d = 0
  let visitorsTotal = 0
  let recentArticles: RecentArticle[] = []
  let dbError: string | null = null

  try {
    await connectDB()
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const Publisher = (await import('@/models/Publisher')).default
    const [articleStatusStats, visitorStatsAgg, authorsCountResult, publishersCountResult] = await Promise.all([
      Article.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: {
                $cond: [{ $eq: ['$status', 'published'] }, 1, 0],
              },
            },
            draft: {
              $sum: {
                $cond: [{ $eq: ['$status', 'draft'] }, 1, 0],
              },
            },
          },
        },
      ]),
      VisitorEvent.aggregate([
        {
          $match: {
            slug: '__home__',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            last24h: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', last24Hours] }, 1, 0],
              },
            },
            last7d: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', last7Days] }, 1, 0],
              },
            },
            last30d: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', last30Days] }, 1, 0],
              },
            },
          },
        },
      ]),
      Author.countDocuments(),
      Publisher.countDocuments(),
    ])

    const articleStats = articleStatusStats[0] || { total: 0, published: 0, draft: 0 }
    const visitorStats = visitorStatsAgg[0] || { total: 0, last24h: 0, last7d: 0, last30d: 0 }

    articlesCount = articleStats.total
    publishedCount = articleStats.published
    draftCount = articleStats.draft
    authorsCount = authorsCountResult
    publishersCount = publishersCountResult
    visitorsLast24h = visitorStats.last24h
    visitorsLast7d = visitorStats.last7d
    visitorsLast30d = visitorStats.last30d
    visitorsTotal = visitorStats.total

    // Optimized: Use stored authorName instead of populate
    recentArticles = await Article.find()
      .select('title authorName category status createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() as RecentArticle[]
  } catch (error: unknown) {
    console.error('Database connection error:', error)
    dbError = error instanceof Error ? error.message : 'Failed to connect to database'
  }

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-700 font-serif">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/articles/new"
                prefetch={true}
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
          {/* Database Error Banner */}
          {dbError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="whitespace-pre-line">{dbError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Publishers</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{publishersCount}</p>
            </div>
          </div>

          {/* Visitor Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Visitors (Last 24 Hours)</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{visitorsLast24h}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Visitors (Last 7 Days)</h3>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{visitorsLast7d}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Visitors (Last 30 Days)</h3>
              <p className="text-3xl font-bold text-teal-600 mt-2">{visitorsLast30d}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Visitors (Total)</h3>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{visitorsTotal}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/articles"
              prefetch={true}
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
              prefetch={true}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-orange-500 rounded-full group-hover:bg-orange-600 transition-colors"></div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Manage Authors</h3>
              </div>
              <p className="text-gray-600 ml-4">Add and manage article authors</p>
            </Link>
            <Link
              href="/admin/publishers"
              prefetch={true}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-orange-500 rounded-full group-hover:bg-orange-600 transition-colors"></div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Manage Publishers</h3>
              </div>
              <p className="text-gray-600 ml-4">Add and manage publishers</p>
            </Link>
            <Link
              href="/admin/live-updates"
              prefetch={true}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-red-600 rounded-full group-hover:bg-red-700 transition-colors"></div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Live Updates</h3>
              </div>
              <p className="text-gray-600 ml-4">Update YouTube live stream link</p>
            </Link>
          </div>

          {/* Publisher Statistics */}
          <div className="mb-8">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-500 p-6">
                  <h2 className="text-xl font-semibold text-orange-700 mb-2">Publisher Statistics</h2>
                  <p className="text-gray-500">Loading publisher statistics...</p>
                </div>
              }
            >
              <PublisherStatistics />
            </Suspense>
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-500">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
              <h2 className="text-xl font-semibold text-orange-700">Recent Articles</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentArticles.map((article) => (
                <Link
                  key={article._id.toString()}
                  href={`/admin/articles/${article._id}`}
                  prefetch={true}
                  className="block px-6 py-4 hover:bg-orange-50 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {article.authorName || 'Unknown'} • <span className="text-orange-600 font-medium">{article.category}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${article.status === 'published'
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
