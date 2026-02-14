import Image from 'next/image'
import Link from 'next/link'

interface TopStoryCardProps {
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

export default function TopStoryCard({
  title,
  subtitle,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: TopStoryCardProps) {
  return (
    <Link 
      href={`/${category}/${slug}`} 
      className="block group"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full">
        {/* Large Image */}
        <div className="relative w-full h-[340px] md:h-[500px] lg:h-[600px] mb-4 overflow-hidden">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
            priority
          />
        </div>
        
        {/* Content */}
        <div className="px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-merriweather group-hover:text-red-600 transition-colors duration-200 line-clamp-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base md:text-lg text-gray-600 mb-4 font-merriweather line-clamp-2">
              {subtitle}
            </p>
          )}
          <p className="text-sm md:text-base text-gray-600 font-sans">
            {authorName} - {publishedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}
