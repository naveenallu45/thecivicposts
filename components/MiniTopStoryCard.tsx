import Image from 'next/image'
import Link from 'next/link'

interface MiniTopStoryCardProps {
  title: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

export default function MiniTopStoryCard({
  title,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: MiniTopStoryCardProps) {
  return (
    <Link 
      href={`/${category}/${slug}`} 
      className="block group"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden flex gap-2 md:gap-3 h-full">
        {/* Small Image */}
        <div className="relative w-24 md:w-28 lg:w-32 flex-shrink-0 h-20 md:h-24 lg:h-28 overflow-hidden rounded">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
            loading="lazy"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2 overflow-hidden">
          <h3 className="text-[11px] md:text-xs lg:text-xs font-bold text-gray-900 mb-1 font-merriweather group-hover:text-red-600 transition-colors duration-200 line-clamp-3 leading-snug">
            {title}
          </h3>
          <p className="text-[10px] md:text-[10px] lg:text-[10px] text-gray-600 font-sans leading-tight truncate">
            {authorName} - {publishedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}
