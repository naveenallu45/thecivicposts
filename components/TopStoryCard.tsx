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
        <div className="relative w-full h-[245px] md:h-[500px] lg:h-[600px] mb-4 overflow-hidden">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
            priority
          />
        </div>
        
        {/* Content - Same width as image */}
        <div className="w-full">
          <h2 className="text-lg md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3 font-merriweather group-hover:text-red-600 transition-colors duration-200">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-4 font-merriweather">
              {subtitle}
            </p>
          )}
          <p className="text-xs md:text-base text-gray-600 font-sans">
            {authorName} - {publishedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}
