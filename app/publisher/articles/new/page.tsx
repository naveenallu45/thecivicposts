// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requirePublisher } from '@/lib/publisher-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function NewPublisherArticlePage() {
  await requirePublisher()
  await connectDB()

  // Optimized: Only select needed fields
  const authors = await Author.find()
    .select('name email')
    .sort({ name: 1 })
    .lean()

  return (
    <ArticleFormWrapper
      authors={authors.map((a) => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
      }))}
      isEdit={false}
      isPublisher={true}
    />
  )
}
