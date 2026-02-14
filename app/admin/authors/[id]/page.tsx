import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import Link from 'next/link'
import AuthorForm from '@/components/admin/AuthorForm'

export const dynamic = 'force-dynamic'

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  await connectDB()

  const { id } = await params
  const author = await Author.findById(id).lean()

  if (!author) {
    redirect('/admin/authors')
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Edit Author</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/authors"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Authors
              </Link>
              <Link
                href="/admin/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AuthorForm
            author={{
              _id: author._id.toString(),
              name: author.name,
              email: author.email,
              bio: author.bio,
              avatar: author.avatar,
            }}
          />
        </div>
      </div>
    </>
  )
}
