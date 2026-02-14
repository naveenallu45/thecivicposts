import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | The Civic Posts',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-orange-600 mb-4 font-merriweather">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-merriweather">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Return Home
          </Link>
          <Link
            href="/news"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Browse News
          </Link>
        </div>
      </div>
    </div>
  )
}
