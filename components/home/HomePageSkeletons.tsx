export function TopStoriesSkeleton() {
  return (
    <div className="mb-12 animate-pulse" aria-hidden>
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 aspect-[3/2] bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function BelowFoldSkeleton() {
  return (
    <div className="space-y-10 animate-pulse" aria-hidden>
      <div className="h-10 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg" />
    </div>
  )
}
