'use client'

import { useState, useRef, useCallback, memo } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

export type ArticleMainCarouselImage = { url: string; alt?: string }

interface ArticleMainImageCarouselProps {
  images: ArticleMainCarouselImage[]
  title: string
}

function ArticleMainImageCarousel({ images, title }: ArticleMainImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const goToSlide = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const w = el.offsetWidth
    if (!w) return
    el.scrollTo({ left: index * w, behavior: 'smooth' })
    setCurrentIndex(index)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const w = el.offsetWidth
    if (!w) return
    const idx = Math.round(el.scrollLeft / w)
    const clamped = Math.max(0, Math.min(images.length - 1, idx))
    setCurrentIndex((prev) => (prev !== clamped ? clamped : prev))
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  if (images.length === 1) {
    const img = images[0]
    return (
      <div className="mb-8 w-full">
        <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg">
          <Image
            src={getOptimizedImageUrl(img.url, 1200, 'auto:best', 800, 'fit')}
            alt={img.alt || title || 'Article main image'}
            fill
            className="object-contain bg-gray-100 image-fade-in"
            unoptimized
            priority
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 1023px) 92vw, min(900px, 55vw)"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 w-full" role="region" aria-label="Article main images">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide rounded-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, idx) => (
          <div
            key={`main-carousel-${idx}`}
            className="w-full min-w-full flex-shrink-0 snap-start"
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg">
              <Image
                src={getOptimizedImageUrl(img.url, 1200, 'auto:best', 800, 'fit')}
                alt={img.alt || title || `Main image ${idx + 1}`}
                fill
                className="object-contain bg-gray-100 image-fade-in"
                unoptimized
                {...(idx === 0
                  ? { priority: true, fetchPriority: 'high' as const }
                  : { loading: 'lazy' as const, fetchPriority: 'low' as const })}
                quality={90}
                sizes="(max-width: 1023px) 92vw, min(900px, 55vw)"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Image carousel position">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === currentIndex}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-orange-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Show main image ${index + 1} of ${images.length}`}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(ArticleMainImageCarousel)
