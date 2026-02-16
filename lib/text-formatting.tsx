import React from 'react'

/**
 * Parse markdown-style bold formatting (**text** or ***text***) and convert to HTML
 */
export function parseBoldText(text: string): string {
  if (!text) return ''
  
  // Replace ***text*** (3 stars) or **text** (2 stars) with <strong>text</strong>
  // Process ***text*** first to avoid conflicts
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

/**
 * Render text with bold formatting as React elements
 * Supports both ***text*** (3 stars) and **text** (2 stars) for bold
 * Production-level implementation with proper edge case handling
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null
  
  const parts: (string | React.ReactElement)[] = []
  let keyCounter = 0
  
  // Process ***text*** first (3 stars - priority), then **text** (2 stars)
  // This prevents conflicts when both patterns exist
  
  // First, handle ***text*** (3 stars)
  const tripleStarRegex = /\*\*\*(.+?)\*\*\*/g
  let match: RegExpExecArray | null
  let lastIndex = 0
  
  // Find all ***text*** patterns
  const tripleStarMatches: Array<{ index: number; length: number; content: string }> = []
  tripleStarRegex.lastIndex = 0
  while ((match = tripleStarRegex.exec(text)) !== null) {
    tripleStarMatches.push({
      index: match.index,
      length: match[0].length,
      content: match[1]
    })
  }
  
  // Then find all **text** patterns that don't overlap with ***text***
  const doubleStarRegex = /\*\*(.+?)\*\*/g
  const doubleStarMatches: Array<{ index: number; length: number; content: string }> = []
  
  // Reset regex
  doubleStarRegex.lastIndex = 0
  while ((match = doubleStarRegex.exec(text)) !== null) {
    // TypeScript knows match is not null here due to while condition
    const currentMatch = match
    
    // Check if this match overlaps with any triple star match
    const overlaps = tripleStarMatches.some(tm => {
      const tmEnd = tm.index + tm.length
      const matchEnd = currentMatch.index + currentMatch[0].length
      return (
        (currentMatch.index >= tm.index && currentMatch.index < tmEnd) ||
        (matchEnd > tm.index && matchEnd <= tmEnd) ||
        (currentMatch.index <= tm.index && matchEnd >= tmEnd)
      )
    })
    
    if (!overlaps) {
      doubleStarMatches.push({
        index: currentMatch.index,
        length: currentMatch[0].length,
        content: currentMatch[1]
      })
    }
  }
  
  // Combine and sort all matches by index
  const allMatches = [
    ...tripleStarMatches.map(m => ({ ...m, type: 'triple' as const })),
    ...doubleStarMatches.map(m => ({ ...m, type: 'double' as const }))
  ].sort((a, b) => a.index - b.index)
  
  // Build the parts array
  lastIndex = 0
  for (const matchItem of allMatches) {
    // Add text before the match
    if (matchItem.index > lastIndex) {
      const beforeText = text.substring(lastIndex, matchItem.index)
      if (beforeText) {
        parts.push(beforeText)
      }
    }
    
    // Add bold text
    parts.push(
      <strong key={`bold-${keyCounter++}`} className="font-bold">
        {matchItem.content}
      </strong>
    )
    
    lastIndex = matchItem.index + matchItem.length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    if (remaining) {
      parts.push(remaining)
    }
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}
