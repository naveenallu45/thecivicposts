'use client'

import { memo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { generateAuthorSlug } from '@/lib/author-utils'

interface TopStoryCardProps {
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

function TopStoryCard({
  title,
  subtitle,
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
      className="block group transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
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
            quality={90}
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
            <span 
              onClick={handleAuthorClick}
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer"
            >
              {authorName}
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
