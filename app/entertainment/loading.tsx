export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-[92%] lg:w-[85%] mx-auto py-12">
        <div className="mb-4 md:mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-100">
              <div className="w-full h-[140px] md:h-[180px] bg-gray-200 animate-pulse"></div>
              <div className="p-2 md:p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
