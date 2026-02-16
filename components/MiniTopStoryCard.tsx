'use client'

import { memo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { generateAuthorSlug } from '@/lib/author-utils'

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
      className="block group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
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

export default memo(MiniTopStoryCard)
