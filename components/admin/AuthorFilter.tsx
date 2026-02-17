'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface AuthorFilterProps {
  authors: string[]
  selectedAuthor: string
}

export default function AuthorFilter({ authors, selectedAuthor }: AuthorFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAuthorChange = useCallback((author: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (author === 'all') {
      params.delete('author')
    } else {
      params.set('author', author)
    }

    router.push(`/admin/articles?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-4">
        <label htmlFor="author-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Filter by Author:
        </label>
        <select
          id="author-filter"
          value={selectedAuthor}
          onChange={(e) => handleAuthorChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 min-w-[200px]"
        >
          <option value="all">All Authors</option>
          {authors.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
        {selectedAuthor !== 'all' && (
          <span className="text-sm text-gray-600">
            ({authors.length} author{authors.length !== 1 ? 's' : ''} available)
          </span>
        )}
      </div>
    </div>
  )
}
