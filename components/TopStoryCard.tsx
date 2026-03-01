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

  // Aggressive prefetching on hover for instant navigation
  const handleMouseEnter = useCallback(() => {
    // Prefetch article page
    router.prefetch(`/${category}/${slug}`)
    
    // Preload article image for instant display
    if (mainImage && mainImage.trim()) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = getOptimizedImageUrl(mainImage, 1200, 'auto:best')
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
      
      // Also preload the actual image to browser cache
      const img = new window.Image()
      img.src = getOptimizedImageUrl(mainImage, 1200, 'auto:best')
    }
  }, [router, category, slug, mainImage])

  return (
    <Link 
      href={`/${category}/${slug}`} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
      className="block group transition-transform duration-200 lg:hover:scale-[1.01] active:scale-[0.99]"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full">
        {/* Large Image - Natural sizing without cropping */}
        <div className="relative w-full mb-4 bg-gray-100">
          {mainImage && mainImage.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getOptimizedImageUrl(mainImage, 1200, 'auto:best')}
              alt={title}
              className="w-full max-h-[600px] h-auto block"
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
            <div className="w-full h-[245px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-200 text-gray-400 text-sm">
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
