import Image from 'next/image'
import Link from 'next/link'

interface ArticleCardProps {
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

export default function ArticleCard({
  title,
  subtitle,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: ArticleCardProps) {
  return (
    <Link 
      href={`/${category}/${slug}`} 
      prefetch={true}
      className="block group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full border border-gray-100 hover:border-gray-200 transition-colors duration-200">
        {/* Horizontal layout for mobile/tablet (1-2 columns) */}
        <div className="flex flex-row h-full lg:hidden">
          {/* Image Side - 40% width on mobile/tablet */}
          <div className="w-2/5 md:w-2/5 flex-shrink-0 relative h-[140px] md:h-[180px] overflow-hidden">
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 40vw"
              loading="lazy"
            />
          </div>
          
          {/* Content Side - 60% width on mobile/tablet */}
          <div className="w-3/5 md:w-3/5 p-2 md:p-4 flex flex-col h-[140px] md:h-[180px]">
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-[10px] md:text-sm font-bold text-gray-900 mb-1 md:mb-2 font-merriweather group-hover:text-red-600 transition-colors duration-200 break-words line-clamp-3 leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[10px] md:text-xs text-gray-600 mb-1.5 md:mb-3 font-merriweather leading-relaxed break-words line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="mt-auto pt-2 md:pt-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] md:text-xs text-gray-600 font-sans truncate pr-2">
                {authorName} - {publishedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Vertical layout for laptop (4 columns) - Image top, text below */}
        <div className="hidden lg:flex flex-col h-full">
          {/* Image Top */}
          <div className="w-full flex-shrink-0 relative h-[180px] overflow-hidden">
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, 100vw"
              loading="lazy"
            />
          </div>
          
          {/* Content Bottom */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-sm font-bold text-gray-900 mb-2 font-merriweather group-hover:text-red-600 transition-colors duration-200 break-words line-clamp-3">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-600 mb-3 font-merriweather leading-relaxed break-words line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-gray-600 font-sans truncate pr-2">
                {authorName} - {publishedDate}
              </p>
              <span className="text-orange-600 text-xs font-sans font-medium group-hover:text-orange-700 transition-colors">
                Read More
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
