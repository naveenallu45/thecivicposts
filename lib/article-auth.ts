import { requireAdminApi } from './admin-auth'
import { requireAuthorApi } from './author-auth'

export interface ArticleAuthResult {
  isAdmin: boolean
  isAuthor: boolean
  authorId?: string
  authorEmail?: string
  authorName?: string
}

/**
 * Check authentication for article operations
 * Returns admin session or author session
 */
export async function requireArticleAuth(): Promise<ArticleAuthResult> {
  try {
    // Try admin first
    await requireAdminApi()
    return {
      isAdmin: true,
      isAuthor: false,
    }
  } catch {
    // If not admin, try author
    try {
      const authorSession = await requireAuthorApi()
      return {
        isAdmin: false,
        isAuthor: true,
        authorId: authorSession.authorId,
        authorEmail: authorSession.email,
        authorName: authorSession.authorName,
      }
    } catch {
      throw new Error('Unauthorized: Admin or Author authentication required')
    }
  }
}
