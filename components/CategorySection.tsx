'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ArticleCard from './ArticleCard'
import SectionHeading from './SectionHeading'
import ViewportPrefetch from './ViewportPrefetch'

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

interface CategorySectionProps {
  articles: Article[]
  categoryName: string
}

// Category mapping for routes - defined outside component to avoid dependency issues
const categoryMap: Record<string, string> = {
  'News': '/news',
  'Entertainment': '/entertainment',
  'Sports': '/sports',
  'Health & Life Style': '/health-fitness',
  'Editorial': '/editorial',
  'Technology': '/technology',
  'Automobiles': '/automobiles',
}

export default function CategorySection({ articles, categoryName }: CategorySectionProps) {
  const router = useRouter()

  // Prefetch category page on mount
  useEffect(() => {
    const categoryPath = categoryMap[categoryName]
    if (categoryPath) {
      router.prefetch(categoryPath)
    }
  }, [categoryName, router])

  if (articles.length === 0) {
    return null
  }

  const categoryPath = categoryMap[categoryName]

  return (
    <div className="mb-12">
      <ViewportPrefetch articles={articles} />
      <SectionHeading title={categoryName} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mt-3 md:mt-6">
        {articles.map((article) => (
          <div key={article.id} data-article-id={`${article.category}/${article.slug}`}>
            <ArticleCard
              title={article.title}
              mainImage={article.mainImage}
              publishedDate={article.publishedDate}
              authorName={article.authorName}
              slug={article.slug}
              category={article.category}
            />
          </div>
        ))}
      </div>
      {categoryPath && (
        <div className="mt-4 md:mt-6 lg:mt-8 flex justify-end">
          <Link
            href={categoryPath}
            className="inline-flex items-center justify-center 
                     px-4 py-2.5 md:px-5 md:py-3 lg:px-6 lg:py-3.5
                     text-sm md:text-base lg:text-lg
                     font-medium md:font-semibold
                     bg-orange-600 text-white 
                     rounded-lg md:rounded-xl
                     hover:bg-orange-700 active:bg-orange-800
                     transition-all duration-200 ease-in-out
                     shadow-md hover:shadow-lg active:shadow-md
                     min-h-[44px] md:min-h-[48px] lg:min-h-[52px]
                     touch-manipulation"
            prefetch={true}
            aria-label={`View more ${categoryName} articles`}
          >
            <span className="whitespace-nowrap">
              View More
            </span>
            <svg
              className="ml-2 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
