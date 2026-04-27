import { formatDateShort } from '@/lib/date-utils'

export type HomeArticleDocument = {
  _id: { toString: () => string }
  title: string
  content?: string[]
  mainImage?: { url: string }
  publishedDate?: Date
  authorName?: string
  slug: string
  category: string
}

export type HomeTransformedArticle = {
  id: string
  title: string
  description?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

function getArticleDescription(content?: string[]): string | undefined {
  if (!Array.isArray(content) || content.length === 0) return undefined
  const firstParagraph = String(content[0] || '').replace(/\s+/g, ' ').trim()
  if (!firstParagraph) return undefined
  return firstParagraph.length > 140 ? `${firstParagraph.slice(0, 140).trim()}...` : firstParagraph
}

export function transformHomeArticle(
  article: HomeArticleDocument | null
): HomeTransformedArticle | null {
  if (!article) return null
  return {
    id: article._id.toString(),
    title: article.title,
    description: getArticleDescription(article.content),
    mainImage: article.mainImage?.url || '',
    publishedDate: article.publishedDate ? formatDateShort(article.publishedDate) : '',
    authorName: article.authorName || 'Unknown',
    slug: article.slug,
    category: article.category,
  }
}
