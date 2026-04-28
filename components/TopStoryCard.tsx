'use client'

import { memo, useCallback, useState } from 'react'
import Image from 'next/image'
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
  /** First visible hero only — avoids competing LCP requests in the carousel */
  priorityImage?: boolean
}

function TopStoryCard({
  title,
  mainImage,
  publishedDate,
  authorName,
  slug,
  category,
  priorityImage = false,
}: TopStoryCardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [imgSrc, setImgSrc] = useState(() =>
    mainImage?.trim() ? getOptimizedImageUrl(mainImage.trim(), 1200, 'auto:best', 800, 'fit') : ''
  )

  const handleAuthorClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => {
      router.push(`/author/${generateAuthorSlug(authorName)}`)
    })
  }, [router, authorName])

  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/${category}/${slug}`)
  }, [router, category, slug])

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
        <div className="relative w-full aspect-[3/2] mb-4 bg-gray-100">
          {mainImage && mainImage.trim() ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-contain bg-gray-100"
              sizes="(max-width: 1024px) 100vw, 66vw"
              {...(priorityImage
                ? { priority: true, fetchPriority: 'high' as const }
                : { loading: 'lazy' as const, fetchPriority: 'low' as const })}
              quality={85}
              onError={() => {
                if (mainImage && imgSrc !== mainImage) {
                  setImgSrc(mainImage)
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

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
