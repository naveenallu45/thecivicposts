/**
 * Generate a URL-friendly slug from author name
 */
export function generateAuthorSlug(authorName: string): string {
  if (!authorName) return ''
  
  return authorName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
}
