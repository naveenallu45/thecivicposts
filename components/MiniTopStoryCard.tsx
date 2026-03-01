'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { generateAuthorSlug, formatAuthorName } from '@/lib/author-utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

interface MiniTopStoryCardProps {
  title: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

function MiniTopStoryCard({
  title,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: MiniTopStoryCardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleAuthorClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => {
      router.push(`/author/${generateAuthorSlug(authorName)}`)
    })
  }, [router, authorName])

  // Prefetch on hover for instant navigation
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/${category}/${slug}`)
  }, [router, category, slug])

  return (
    <Link 
      href={`/${category}/${slug}`} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      className="block group transition-transform duration-200 lg:hover:scale-[1.02]"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden flex gap-2 md:gap-3 h-full">
        {/* Small Image */}
        <div className="relative w-24 md:w-28 lg:w-32 flex-shrink-0 h-20 md:h-24 lg:h-28 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
          {mainImage && mainImage.trim() ? (
            <img
              src={getOptimizedImageUrl(mainImage, 128)}
              alt={title}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to raw URL if optimized URL fails
                const target = e.target as HTMLImageElement
                if (target.src !== mainImage && mainImage) {
                  target.src = mainImage
                } else {
                  // Hide broken image if both URLs fail
                  target.style.display = 'none'
                }
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-[8px]">
              No Image
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2 overflow-hidden">
          <h3 className="text-[11px] md:text-xs lg:text-xs font-bold text-gray-900 mb-1 font-merriweather group-hover:text-red-600 transition-colors duration-200 line-clamp-3 leading-snug">
            {title}
          </h3>
          <p className="text-[10px] md:text-[10px] lg:text-[10px] text-gray-600 font-sans leading-tight truncate">
            <span 
              onClick={handleAuthorClick}
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer"
            >
              {formatAuthorName(authorName)}
            </span>
            {' - '}
            {publishedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default memo(MiniTopStoryCard)
