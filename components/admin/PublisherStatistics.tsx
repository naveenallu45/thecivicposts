import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Publisher from '@/models/Publisher'
import mongoose from 'mongoose'

interface PublisherStats {
  publisherId: string
  publisherName: string
  publisherEmail: string
  total: number
  thisMonth: number
  thisWeek: number
  today: number
}

export default async function PublisherStatistics() {
  await connectDB()

  // Get all publishers
  const publishers = await Publisher.find()
    .select('_id name email')
    .lean()

  if (publishers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-500 p-6">
        <h2 className="text-xl font-semibold text-orange-700 mb-4">Publisher Statistics</h2>
        <p className="text-gray-500">No publishers found.</p>
      </div>
    )
  }

  // Calculate date ranges (UTC to avoid timezone issues)
  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay()) // Start of week (Sunday)
  weekStart.setUTCHours(0, 0, 0, 0)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  // Use MongoDB aggregation for efficient counting
  const publisherIds = publishers.map(p => new mongoose.Types.ObjectId(p._id.toString()))

  // Aggregate statistics using MongoDB aggregation pipeline for better performance
  const statsAggregation = await Article.aggregate([
    {
      $match: {
        status: 'published',
        publisher: { $in: publisherIds }
      }
    },
    {
      $group: {
        _id: '$publisher',
        total: { $sum: 1 },
        today: {
          $sum: {
            $cond: [{ $gte: ['$publishedDate', todayStart] }, 1, 0]
          }
        },
        thisWeek: {
          $sum: {
            $cond: [{ $gte: ['$publishedDate', weekStart] }, 1, 0]
          }
        },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ['$publishedDate', monthStart] }, 1, 0]
          }
        }
      }
    }
  ])

  interface AggregationStat {
    _id: mongoose.Types.ObjectId | null
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }

  // Create a map for quick lookup
  const statsMap = new Map<string, { total: number; today: number; thisWeek: number; thisMonth: number }>()
  
  statsAggregation.forEach((stat: AggregationStat) => {
    if (stat._id) {
      statsMap.set(stat._id.toString(), {
        total: stat.total || 0,
        today: stat.today || 0,
        thisWeek: stat.thisWeek || 0,
        thisMonth: stat.thisMonth || 0,
      })
    }
  })

  // Combine publisher info with statistics
  const publisherStats: PublisherStats[] = publishers.map((publisher) => {
    const publisherId = publisher._id.toString()
    const stats = statsMap.get(publisherId) || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 }
    
    return {
      publisherId,
      publisherName: publisher.name,
      publisherEmail: publisher.email,
      ...stats,
    }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-500">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
        <h2 className="text-xl font-semibold text-orange-700">Publisher Statistics</h2>
        <p className="text-sm text-gray-600 mt-1">Published articles by publisher</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publisher
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                This Month
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                This Week
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Today
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {publisherStats.map((stat) => (
              <tr key={stat.publisherId} className="hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{stat.publisherName}</div>
                    <div className="text-sm text-gray-500">{stat.publisherEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-semibold text-gray-900">{stat.total}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-semibold text-orange-600">{stat.thisMonth}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-semibold text-blue-600">{stat.thisWeek}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-semibold text-green-600">{stat.today}</span>
                </td>
              </tr>
            ))}
            {publisherStats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No published articles found for any publisher.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
