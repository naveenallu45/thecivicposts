import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Publisher from '@/models/Publisher'
import Link from 'next/link'
import PublisherForm from '@/components/admin/PublisherForm'
import LogoutButton from '@/components/admin/LogoutButton'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPublisherPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  await connectDB()

  const { id } = await params
  const publisher = await Publisher.findById(id).select('-password').lean()

  if (!publisher) {
    notFound()
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Edit Publisher</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/publishers"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Publishers
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <PublisherForm
            publisher={{
              _id: publisher._id.toString(),
              name: publisher.name,
              email: publisher.email,
              avatar: publisher.avatar,
            }}
          />
        </div>
      </div>
    </>
  )
}
