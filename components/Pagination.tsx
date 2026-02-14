'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Only show pagination when there are more than 10 articles (2+ pages)
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    // Always include page parameter in URL for clarity
    if (page === 1) {
      params.delete('page')
      // For page 1, return clean URL without page param
      return pathname
    } else {
      params.set('page', page.toString())
      const queryString = params.toString()
      return `${pathname}?${queryString}`
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Show first 4 pages + ellipsis + last page
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 4 pages
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Link>
      ) : (
        <span className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1 md:gap-2">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 md:px-3 py-2 text-gray-500"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`min-w-[36px] md:min-w-[44px] px-3 md:px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed">
          Next
        </span>
      )}
    </div>
  )
}
