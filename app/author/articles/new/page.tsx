// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireAuthor } from '@/lib/author-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function NewAuthorArticlePage() {
  const session = await requireAuthor()
  await connectDB()

  // Authors can only see themselves
  const author = await Author.findOne({ email: session.email })
  if (!author) {
    throw new Error('Author not found')
  }

  return (
    <ArticleFormWrapper
      authors={[{
        _id: author._id.toString(),
        name: author.name,
        email: author.email,
      }]}
      isEdit={false}
      isAuthor={true}
    />
  )
}
