// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { redirect } from 'next/navigation'
import { requireAuthor } from '@/lib/author-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'

export default async function EditAuthorArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuthor()
  await connectDB()

  const { id } = await params
  
  // Get article and author
  const [article, author] = await Promise.all([
    Article.findById(id)
      .select('title subtitle content author publishedDate mainImage miniImage youtubeLink subImages status category')
      .lean(),
    Author.findOne({ email: session.email })
      .select('name email')
      .lean(),
  ])

  if (!article) {
    redirect('/author/dashboard')
  }

  if (!author) {
    throw new Error('Author not found')
  }

  // Check if author owns this article
  if (article.author.toString() !== author._id.toString()) {
    redirect('/author/dashboard')
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
        miniImage: article.miniImage && article.miniImage.url ? article.miniImage : undefined,
        youtubeLink: article.youtubeLink,
        subImages: article.subImages,
        status: article.status,
        category: article.category,
      }}
      authors={[{
        _id: author._id.toString(),
        name: author.name,
        email: author.email,
      }]}
      isEdit={true}
      isAuthor={true}
    />
  )
}
