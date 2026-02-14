// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import TopStoriesSection from '@/components/TopStoriesSection'
import TrendingSection from '@/components/TrendingSection'
import CategorySection from '@/components/CategorySection'
import { formatDateShort } from '@/lib/date-utils'

// ISR: Revalidate home page every 30 seconds
export const revalidate = 30

const categories = [
  { key: 'news', name: 'News' },
  { key: 'entertainment', name: 'Entertainment' },
  { key: 'sports', name: 'Sports' },
  { key: 'health-fitness', name: 'Health & Fitness' },
  { key: 'editorial', name: 'Editorial' },
]

export default async function Home() {
  await connectDB()

  // Fetch all required articles in parallel
  // Optimized: Removed populate() calls since authorName is already stored in article document
  // This eliminates N+1 query problem and improves performance with 100k+ articles
  const [topStories, miniTopStories, trendingArticles, ...categoryArticles] = await Promise.all([
    // Top Stories (multiple articles for carousel) - Limit to 10 for performance
    Article.find({ status: 'published', isTopStory: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean(),
    
    // Mini Top Stories (6 articles)
    Article.find({ status: 'published', isMiniTopStory: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean(),
    
    // Trending (4 articles)
    Article.find({ status: 'published', isTrending: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean(),
    
    // Latest articles for each category (4 per category)
    ...categories.map(cat =>
      Article.find({ status: 'published', isLatest: true, category: cat.key })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean()
    ),
  ])

  // Helper function to transform article data
  interface ArticleDocument {
    _id: { toString: () => string }
    title: string
    subtitle?: string
    mainImage?: { url: string }
    publishedDate?: Date
    authorName?: string
    slug: string
    category: string
  }

  interface TransformedArticle {
    id: string
    title: string
    subtitle?: string
    mainImage: string
    publishedDate: string
    authorName: string
    slug: string
    category: string
  }

  const transformArticle = (article: ArticleDocument | null): TransformedArticle | null => {
    if (!article) return null
    return {
      id: article._id.toString(),
      title: article.title,
      subtitle: article.subtitle,
      mainImage: article.mainImage?.url || '',
      publishedDate: article.publishedDate
        ? formatDateShort(article.publishedDate)
        : '',
      authorName: article.authorName || 'Unknown',
      slug: article.slug,
      category: article.category,
    }
  }

  const topStoriesData = (topStories as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
  const miniTopStoriesData = (miniTopStories as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
  const trendingData = (trendingArticles as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
  const categoryData = categoryArticles.map((articles: ArticleDocument[]) => 
    articles.map(transformArticle).filter(Boolean) as TransformedArticle[]
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Stories Section */}
        <TopStoriesSection 
          topStories={topStoriesData}
          miniTopStories={miniTopStoriesData}
        />

        {/* Trending Section */}
        <TrendingSection articles={trendingData} />

        {/* Category Sections */}
        {categories.map((cat, index) => (
          <CategorySection
            key={cat.key}
            articles={categoryData[index] || []}
            categoryName={cat.name}
          />
        ))}
      </div>
    </main>
  )
}
