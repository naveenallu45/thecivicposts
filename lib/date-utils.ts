/**
 * Format date to short format: "FEB 13, 2026"
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formatted = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  // Convert to uppercase: "Feb 13, 2026" -> "FEB 13, 2026"
  return formatted.toUpperCase()
}
