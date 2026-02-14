import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import Link from 'next/link'
import AuthorForm from '@/components/admin/AuthorForm'
import AuthorsList from '@/components/admin/AuthorsList'
import LogoutButton from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
  await requireAdmin()
  await connectDB()

  // Optimized: Only select needed fields
  const authors = await Author.find()
    .select('name email bio avatar')
    .sort({ name: 1 })
    .lean()

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Authors</h1>
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
          {/* Left Side - Add New Author Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Add New Author</h2>
            <AuthorForm />
          </div>

          {/* Right Side - All Authors List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-serif">All Authors</h2>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <AuthorsList
                authors={authors.map((author: { _id: { toString: () => string }; name: string; email: string; bio?: string; avatar?: string }) => ({
                  _id: author._id.toString(),
                  name: author.name,
                  email: author.email,
                  bio: author.bio,
                  avatar: author.avatar,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
