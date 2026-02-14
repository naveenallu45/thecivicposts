import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  await requireAdmin()
  await connectDB()

  const authors = await Author.find().sort({ name: 1 }).lean()

  return (
    <ArticleFormWrapper
      authors={authors.map((a) => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
      }))}
      isEdit={false}
    />
  )
}
