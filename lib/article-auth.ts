import { requireAdminApi } from './admin-auth'
import { requirePublisherApi } from './publisher-auth'

export interface ArticleAuthResult {
  isAdmin: boolean
  isPublisher: boolean
  publisherId?: string
  publisherEmail?: string
  publisherName?: string
}

/**
 * Check authentication for article operations
 * Returns admin session or publisher session
 * Note: Authors no longer have login - they are just names that publishers can select
 */
export async function requireArticleAuth(): Promise<ArticleAuthResult> {
  try {
    // Try admin first
    await requireAdminApi()
    return {
      isAdmin: true,
      isPublisher: false,
    }
  } catch {
    // If not admin, try publisher
    try {
      const publisherSession = await requirePublisherApi()
      return {
        isAdmin: false,
        isPublisher: true,
        publisherId: publisherSession.publisherId,
        publisherEmail: publisherSession.email,
        publisherName: publisherSession.publisherName,
      }
    } catch {
      throw new Error('Unauthorized: Admin or Publisher authentication required')
    }
  }
}
