'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface PublisherFilterProps {
  publishers: Array<{ id: string; name: string }>
  selectedPublisher: string
}

export default function PublisherFilter({ publishers, selectedPublisher }: PublisherFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePublisherChange = useCallback((publisherId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (publisherId === 'all') {
      params.delete('publisher')
    } else {
      params.set('publisher', publisherId)
    }

    router.push(`/admin/articles?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-4">
        <label htmlFor="publisher-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Filter by Publisher:
        </label>
        <select
          id="publisher-filter"
          value={selectedPublisher}
          onChange={(e) => handlePublisherChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 min-w-[200px]"
        >
          <option value="all">All Publishers</option>
          {publishers.map((publisher) => (
            <option key={publisher.id} value={publisher.id}>
              {publisher.name}
            </option>
          ))}
        </select>
        {selectedPublisher !== 'all' && (
          <span className="text-sm text-gray-600">
            ({publishers.length} publisher{publishers.length !== 1 ? 's' : ''} available)
          </span>
        )}
      </div>
    </div>
  )
}
