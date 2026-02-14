import React from 'react'

/**
 * Parse markdown-style bold formatting (**text**) and convert to HTML
 */
export function parseBoldText(text: string): string {
  if (!text) return ''
  
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

/**
 * Render text with bold formatting as React elements
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null
  
  const parts: (string | React.ReactElement)[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  let keyCounter = 0
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Add bold text
    parts.push(
      <strong key={`bold-${keyCounter++}`}>{match[1]}</strong>
    )
    
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}
