// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { redirect } from 'next/navigation'
import { requirePublisher } from '@/lib/publisher-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import Publisher from '@/models/Publisher'
import ArticleFormWrapper from '@/components/admin/ArticleFormWrapper'

export const dynamic = 'force-dynamic'

export default async function EditPublisherArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requirePublisher()
  await connectDB()

  const { id } = await params
  
  // Get publisher's ObjectId
  const publisher = await Publisher.findOne({ email: session.email })
  if (!publisher) {
    throw new Error('Publisher not found')
  }
  
  // Optimized: Parallel queries instead of sequential
  const [article, authors] = await Promise.all([
    Article.findOne({
      _id: id,
      publisher: publisher._id, // Ensure publisher owns this article
    })
      .select('title subtitle content author publishedDate mainImage miniImage youtubeLink subImages status category')
      .lean(),
    Author.find()
      .select('name email')
      .sort({ name: 1 })
      .lean(),
  ])

  if (!article) {
    redirect('/publisher/articles')
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
      authors={authors.map((a) => ({
        _id: a._id.toString(),
        name: a.name,
        email: a.email,
      }))}
      isEdit={true}
      isPublisher={true}
    />
  )
}
