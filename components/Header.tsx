import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      {/* Top Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-600 tracking-tight font-serif">
              The Civic Posts
            </h1>
          </Link>
        </div>
      </div>
    </header>
  )
}
