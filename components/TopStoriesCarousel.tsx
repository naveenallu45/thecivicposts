'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function TopStoriesCarousel({ articles }: TopStoriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (articles.length <= 1) return

    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length)
      }, 5000) // 5 second delay
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

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

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
    <div className="relative group">
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
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

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-label="Previous article"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-label="Next article"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

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
