'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import TopStoriesCarousel from './TopStoriesCarousel'
import MiniTopStoryCard from './MiniTopStoryCard'
import SectionHeading from './SectionHeading'
import ViewportPrefetch from './ViewportPrefetch'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

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

interface TopStoriesSectionProps {
  topStories: Article[]
  miniTopStories: Article[]
}

export default function TopStoriesSection({ topStories, miniTopStories }: TopStoriesSectionProps) {
  const router = useRouter()
  const allArticles = useMemo(() => [...topStories, ...miniTopStories], [topStories, miniTopStories])

  // Aggressively prefetch all articles and images immediately
  useEffect(() => {
    allArticles.forEach((article) => {
      // Prefetch article page
      router.prefetch(`/${article.category}/${article.slug}`)
      
      // Preload article images immediately for instant display
      if (article.mainImage && article.mainImage.trim()) {
        try {
          const imageUrl = getOptimizedImageUrl(article.mainImage, 1200, 'auto:best')
          
          // Preload link
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = imageUrl
          link.setAttribute('fetchpriority', 'high')
          document.head.appendChild(link)
          
          // Preload actual image to browser cache
          const img = new window.Image()
          img.src = imageUrl
        } catch {}
      }
    })
  }, [allArticles, router])

  if (topStories.length === 0 && miniTopStories.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <ViewportPrefetch articles={allArticles} />
      <SectionHeading title="Top Stories" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3 md:mt-6">
        {/* Large Featured Articles Carousel - Left Side */}
        <div className="lg:col-span-2">
          {topStories.length > 0 ? (
            <TopStoriesCarousel articles={topStories} />
          ) : (
            <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
              <p className="text-gray-500">No top story selected</p>
            </div>
          )}
        </div>

        {/* Mini Top Stories - Right Side */}
        <div className="lg:col-span-1 space-y-4">
          {miniTopStories.length > 0 ? (
            miniTopStories.map((article) => (
              <div key={article.id} data-article-id={`${article.category}/${article.slug}`}>
                <MiniTopStoryCard
                  title={article.title}
                  mainImage={article.mainImage}
                  publishedDate={article.publishedDate}
                  authorName={article.authorName}
                  slug={article.slug}
                  category={article.category}
                />
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No mini top story {i}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
