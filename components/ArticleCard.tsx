'use client'

import { memo, useCallback } from 'react'
import Image from 'next/image'
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

  // Prefetch on hover for instant navigation
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/${category}/${slug}`)
  }, [router, category, slug])

  return (
    <Link 
      href={`/${category}/${slug}`} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      className="block group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg transition-all duration-200 lg:hover:scale-[1.02]"
      aria-label={`Read article: ${title}`}
    >
      <div className="bg-white rounded-lg overflow-hidden h-full border border-gray-100 hover:border-gray-200 transition-colors duration-200">
        {/* Horizontal layout for mobile/tablet (1-2 columns) */}
        <div className="flex flex-row h-full lg:hidden">
          {/* Image Side - 40% width on mobile/tablet (reduced by 15%) */}
          <div className="w-[34%] md:w-[34%] flex-shrink-0 relative h-[119px] md:h-[153px] overflow-hidden">
            <Image
              src={getOptimizedImageUrl(mainImage, 400)}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 40vw"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
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
          {/* Image Top */}
          <div className="w-full flex-shrink-0 relative h-[153px] overflow-hidden">
            <Image
              src={getOptimizedImageUrl(mainImage, 500, 'auto:best')}
              alt={title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, 100vw"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
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
