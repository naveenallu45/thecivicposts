import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'

export const dynamic = 'force-dynamic'

// Redirect old /article/[slug] URLs to new /[category]/[slug] format
export default async function OldArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await connectDB()

  const { slug } = await params
  const article = await Article.findOne({ slug, status: 'published' })
    .select('category')
    .lean()

  if (!article) {
    redirect('/')
  }

  // Redirect to the new category-based URL
  redirect(`/${article.category}/${slug}`)
}
