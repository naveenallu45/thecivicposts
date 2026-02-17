import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Publisher from '@/models/Publisher'
import Link from 'next/link'
import PublisherForm from '@/components/admin/PublisherForm'
import PublishersList from '@/components/admin/PublishersList'
import LogoutButton from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function PublishersPage() {
  await requireAdmin()
  await connectDB()

  // Optimized: Only select needed fields
  const publishers = await Publisher.find()
    .select('name email avatar')
    .sort({ name: 1 })
    .lean()

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Publishers</h1>
            <div className="flex gap-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Add New Publisher Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Add New Publisher</h2>
            <PublisherForm />
          </div>

          {/* Right Side - All Publishers List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-serif">All Publishers</h2>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <PublishersList
                publishers={publishers.map((publisher: { _id: { toString: () => string }; name: string; email: string; avatar?: string }) => ({
                  _id: publisher._id.toString(),
                  name: publisher.name,
                  email: publisher.email,
                  avatar: publisher.avatar,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
