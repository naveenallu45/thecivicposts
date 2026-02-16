'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import TopStoryCard from './TopStoryCard'

interface Article {
  id: string
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

interface TopStoriesCarouselProps {
  articles: Article[]
}

function TopStoriesCarousel({ articles }: TopStoriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll with production-level delay (7 seconds)
  useEffect(() => {
    if (articles.length <= 1) return

    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length)
      }, 7000) // 7 second delay - production level timing
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [articles.length, isAutoPlaying])

  // Scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollPosition = currentIndex * container.offsetWidth
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [currentIndex])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  // Touch/swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance && currentIndex < articles.length - 1) {
      // Swipe left - next slide
      goToSlide(currentIndex + 1)
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      // Swipe right - previous slide
      goToSlide(currentIndex - 1)
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }, [touchStart, touchEnd, currentIndex, articles.length, goToSlide])

  if (articles.length === 0) {
    return null
  }

  if (articles.length === 1) {
    return (
      <TopStoryCard
        title={articles[0].title}
        subtitle={articles[0].subtitle}
        mainImage={articles[0].mainImage}
        publishedDate={articles[0].publishedDate}
        authorName={articles[0].authorName}
        slug={articles[0].slug}
        category={articles[0].category}
      />
    )
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="w-full flex-shrink-0 snap-start"
          >
            <TopStoryCard
              title={article.title}
              subtitle={article.subtitle}
              mainImage={article.mainImage}
              publishedDate={article.publishedDate}
              authorName={article.authorName}
              slug={article.slug}
              category={article.category}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-orange-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(TopStoriesCarousel)
