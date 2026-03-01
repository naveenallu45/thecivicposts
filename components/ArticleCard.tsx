'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { generateAuthorSlug, formatAuthorName } from '@/lib/author-utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

interface ArticleCardProps {
  title: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

function ArticleCard({
  title,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
}: ArticleCardProps) {
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
    
    // Prefetch article API data
    try {
      fetch(`/api/articles?category=${category}&excludeSlug=${slug}&page=1&limit=10`, {
        method: 'GET',
        cache: 'force-cache'
      }).catch(() => {})
    } catch {}
  }, [router, category, slug, mainImage])

  return (
    <Link 
      href={`/${category}/${slug}`} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
      className="block group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg transition-all duration-200 lg:hover:scale-[1.02] active:scale-[0.98]"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full border border-gray-100 hover:border-gray-200 transition-colors duration-200">
        {/* Horizontal layout for mobile/tablet (1-2 columns) */}
        <div className="flex flex-row h-full lg:hidden">
          {/* Image Side - Natural sizing without cropping */}
          <div className="w-[34%] md:w-[34%] flex-shrink-0 flex items-center justify-center bg-gray-100">
            {mainImage && mainImage.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getOptimizedImageUrl(mainImage, 400)}
                alt={title}
                className="max-w-full max-h-[119px] md:max-h-[153px] w-auto h-auto"
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
              <div className="w-full h-[119px] md:h-[153px] flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          
          {/* Content Side - 66% width on mobile/tablet (increased to compensate for image reduction) */}
          <div className="w-[66%] md:w-[66%] p-2 md:p-4 flex flex-col h-[119px] md:h-[153px]">
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="text-[12px] md:text-base font-bold text-gray-900 mb-1 md:mb-2 font-merriweather group-hover:text-red-600 transition-colors duration-200 break-words line-clamp-3 leading-tight">
                {title}
              </h3>
            </div>
            <div className="mt-auto pt-2 md:pt-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] md:text-xs text-gray-600 font-sans truncate pr-2">
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
        </div>

        {/* Vertical layout for laptop (4 columns) - Image top, text below */}
        <div className="hidden lg:flex flex-col h-full">
          {/* Image Top - Natural sizing without cropping */}
          <div className="w-full flex-shrink-0 flex items-center justify-center bg-gray-100 min-h-[153px]">
            {mainImage && mainImage.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getOptimizedImageUrl(mainImage, 500, 'auto:best')}
                alt={title}
                className="w-full max-h-[300px] h-auto"
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
              <div className="w-full h-[153px] flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          
          {/* Content Bottom */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            {/* Title with inline Read More */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 mb-3">
              <h3 className="text-[12.8px] font-bold text-gray-900 font-merriweather transition-colors duration-200 break-words line-clamp-3 leading-relaxed">
                <span className="group-hover:text-red-600 transition-colors">{title}</span>
                <span className="text-red-600 font-medium ml-2 group-hover:text-red-700 transition-colors">
                  Read More
                </span>
              </h3>
            </div>
            {/* Author and Date */}
            <div className="mt-auto pt-3 border-t border-gray-200 flex items-center gap-2 flex-shrink-0 min-h-0">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span 
                  onClick={handleAuthorClick}
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer truncate block min-w-0 text-[11.9px]"
                  style={{ maxWidth: 'calc(100% - 80px)' }}
                >
                  {formatAuthorName(authorName)}
                </span>
                <span className="text-gray-600 whitespace-nowrap flex-shrink-0 text-[11.9px]">
                  {' - '}
                </span>
                <span className="text-gray-600 whitespace-nowrap flex-shrink-0 text-[11.9px]">
                  {publishedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(ArticleCard)
