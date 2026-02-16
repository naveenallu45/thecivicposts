'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CategorySection({ articles, categoryName }: CategorySectionProps) {
  const router = useRouter()

  // Prefetch category page on mount
  useEffect(() => {
    const categoryMap: Record<string, string> = {
      'News': '/news',
      'Entertainment': '/entertainment',
      'Sports': '/sports',
      'Health & Life Style': '/health-fitness',
      'Editorial': '/editorial',
      'Technology': '/technology',
      'Automobiles': '/automobiles',
    }
    
    const categoryPath = categoryMap[categoryName]
    if (categoryPath) {
      router.prefetch(categoryPath)
    }
  }, [categoryName, router])

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <ViewportPrefetch articles={articles} />
      <SectionHeading title={categoryName} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-3 md:mt-6">
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
    </div>
  )
}
