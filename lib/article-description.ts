export function getArticleDescription(content?: string[], maxLength = 180): string | undefined {
  const firstParagraph = Array.isArray(content) ? String(content[0] || '') : ''
  const normalized = firstParagraph.replace(/\s+/g, ' ').trim()
  if (!normalized) return undefined
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}...` : normalized
}
