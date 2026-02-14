import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  await connectDB()

  const { id } = await params
  const article = await Article.findById(id).lean()
  const authors = await Author.find().sort({ name: 1 }).lean()

  if (!article) {
    redirect('/admin/dashboard')
  }

  return (
    <ArticleFormWrapper
      article={{
        _id: article._id.toString(),
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        author: article.author.toString(),
        publishedDate: article.publishedDate.toISOString(),
        mainImage: article.mainImage,
        subImages: article.subImages,
        status: article.status,
        category: article.category,
      }}
      authors={authors.map((a) => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
      }))}
      isEdit={true}
    />
  )
}
