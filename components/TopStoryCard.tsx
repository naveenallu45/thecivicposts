'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { generateAuthorSlug, formatAuthorName } from '@/lib/author-utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

interface TopStoryCardProps {
  title: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

function TopStoryCard({
  title,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: TopStoryCardProps) {
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
      className="block group transition-transform duration-200 lg:hover:scale-[1.01]"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full">
        {/* Large Image */}
        <div className="relative w-full h-[245px] md:h-[500px] lg:h-[600px] mb-4 overflow-hidden bg-gray-100">
          {mainImage && mainImage.trim() ? (
            <img
              src={getOptimizedImageUrl(mainImage, 1200, 'auto:best')}
              alt={title}
              className="w-full h-full object-cover"
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
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>
        
        {/* Content - Same width as image */}
        <div className="w-full px-4 md:px-6">
          <h2 className="text-lg md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3 font-merriweather group-hover:text-red-600 transition-colors duration-200 break-words">
            {title}
          </h2>
          <p className="text-xs md:text-base text-gray-600 font-sans">
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

export default memo(TopStoryCard)
