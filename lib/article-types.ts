export interface ArticleListItem {
  _id: { toString: () => string }
  title: string
  subtitle?: string
  mainImage?: {
    url: string
    public_id: string
    alt?: string
  }
  publishedDate: Date
  author?: {
    name?: string
  } | string | null
  authorName?: string
  slug: string
  category: string
  createdAt: Date
}
