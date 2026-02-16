'use client'

interface LoadingSkeletonProps {
  type?: 'card' | 'article' | 'carousel'
  count?: number
}

export default function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  if (type === 'carousel') {
    return (
      <div className="w-full h-[245px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse rounded-lg" />
    )
  }

  if (type === 'article') {
    return (
      <div className="space-y-6">
        <div className="h-8 md:h-12 bg-gray-200 animate-pulse rounded w-3/4" />
        <div className="h-6 md:h-8 bg-gray-200 animate-pulse rounded w-full" />
        <div className="h-64 md:h-96 bg-gray-200 animate-pulse rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg overflow-hidden h-full border border-gray-100 animate-shimmer"
        >
          {/* Mobile/Tablet Layout */}
          <div className="flex flex-row h-full lg:hidden">
            <div className="w-2/5 flex-shrink-0 h-[140px] md:h-[180px] bg-gray-200" />
            <div className="w-3/5 p-2 md:p-4 flex flex-col">
              <div className="h-3 md:h-4 bg-gray-200 rounded mb-2 w-full" />
              <div className="h-3 md:h-4 bg-gray-200 rounded mb-2 w-4/5" />
              <div className="h-2 md:h-3 bg-gray-200 rounded mt-auto w-3/4" />
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-col h-full">
            <div className="w-full h-[180px] bg-gray-200" />
            <div className="p-4 flex flex-col flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-5/6" />
              <div className="h-3 bg-gray-200 rounded mt-auto w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
