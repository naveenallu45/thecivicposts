import { formatDateShort } from '@/lib/date-utils'

export type HomeArticleDocument = {
  _id: { toString: () => string }
  title: string
  subtitle?: string
  mainImage?: { url: string }
  publishedDate?: Date
  authorName?: string
  slug: string
  category: string
}

export type HomeTransformedArticle = {
  id: string
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

export function transformHomeArticle(
  article: HomeArticleDocument | null
): HomeTransformedArticle | null {
  if (!article) return null
  return {
    id: article._id.toString(),
    title: article.title,
    subtitle: article.subtitle,
    mainImage: article.mainImage?.url || '',
    publishedDate: article.publishedDate ? formatDateShort(article.publishedDate) : '',
    authorName: article.authorName || 'Unknown',
    slug: article.slug,
    category: article.category,
  }
}
