// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import TopStoriesSection from '@/components/TopStoriesSection'
import TrendingSection from '@/components/TrendingSection'
import CategorySection from '@/components/CategorySection'
import AutoRefreshWrapper from '@/components/AutoRefreshWrapper'
import StructuredData from '@/components/StructuredData'
import { formatDateShort } from '@/lib/date-utils'

// ISR: Revalidate home page every 30 seconds
// Production-level caching with stale-while-revalidate
export const revalidate = 30
export const dynamic = 'force-static'

const categories = [
  { key: 'news', name: 'News' },
  { key: 'entertainment', name: 'Entertainment' },
  { key: 'sports', name: 'Sports' },
  { key: 'health-fitness', name: 'Health & Life Style' },
  { key: 'editorial', name: 'Editorial' },
  { key: 'technology', name: 'Technology' },
  { key: 'automobiles', name: 'Automobiles' },
]

// Helper interfaces for article transformation
type ArticleDocument = {
  _id: { toString: () => string }
  title: string
  subtitle?: string
  mainImage?: { url: string }
  publishedDate?: Date
  authorName?: string
  slug: string
  category: string
}

type TransformedArticle = {
  id: string
  title: string
  subtitle?: string
  mainImage: string
  publishedDate: string
  authorName: string
  slug: string
  category: string
}

export default async function Home() {
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

  // Try to connect to database, but handle errors gracefully during build
  let dbConnected = false
  try {
    await connectDB()
    dbConnected = true
  } catch (error) {
    console.error('Database connection failed during build:', error)
    // During build, if DB connection fails, return empty state
    // This allows the build to complete successfully
    dbConnected = false
  }

  // If database connection failed, return empty homepage
  if (!dbConnected) {
    return (
      <AutoRefreshWrapper interval={30}>
        <StructuredData data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'The Civic Posts',
          url: 'https://www.thecivicposts.com',
        }} />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">The Civic Posts</h1>
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        </main>
      </AutoRefreshWrapper>
    )
  }

  // Fetch all required articles in parallel
  // Optimized: Removed populate() calls since authorName is already stored in article document
  // This eliminates N+1 query problem and improves performance with 100k+ articles
  // Filter out articles with future publishedDate
  let topStories: ArticleDocument[] = []
  let miniTopStories: ArticleDocument[] = []
  let trendingArticles: ArticleDocument[] = []
  let categoryArticles: ArticleDocument[][] = []

  try {
    const results = await Promise.all([
      // Top Stories (multiple articles for carousel) - Limit to 10 for performance
      Article.find({ 
        status: 'published', 
        isTopStory: true,
        publishedDate: { $lte: currentDate } // Only show articles published today or earlier
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      
      // Mini Top Stories (6 articles)
      Article.find({ 
        status: 'published', 
        isMiniTopStory: true,
        publishedDate: { $lte: currentDate }
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      
      // Trending (4 articles)
      Article.find({ 
        status: 'published', 
        isTrending: true,
        publishedDate: { $lte: currentDate }
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      
      // Latest articles for each category (4 per category) - exclude top story, mini top story, and trending
      ...categories.map(cat =>
        Article.find({ 
          status: 'published', 
          category: cat.key,
          publishedDate: { $lte: currentDate },
          isTopStory: { $ne: true },
          isMiniTopStory: { $ne: true },
          isTrending: { $ne: true }
        })
          .sort({ createdAt: -1 })
          .limit(4)
          .select('title subtitle mainImage publishedDate authorName slug category')
          .lean()
      ),
    ])

    topStories = results[0] as ArticleDocument[]
    miniTopStories = results[1] as ArticleDocument[]
    trendingArticles = results[2] as ArticleDocument[]
    categoryArticles = results.slice(3) as ArticleDocument[][]
  } catch (error) {
    console.error('Error fetching articles during build:', error)
    // Return empty arrays if query fails - allows build to complete
  }

  // Helper function to transform article data
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

  // Handle potential errors during article fetching
  let topStoriesData: TransformedArticle[] = []
  let miniTopStoriesData: TransformedArticle[] = []
  let trendingData: TransformedArticle[] = []
  let categoryData: TransformedArticle[][] = []

  try {
    topStoriesData = (topStories as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
    miniTopStoriesData = (miniTopStories as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
    trendingData = (trendingArticles as ArticleDocument[]).map(transformArticle).filter(Boolean) as TransformedArticle[]
    categoryData = categoryArticles.map((articles: ArticleDocument[]) => 
      articles.map(transformArticle).filter(Boolean) as TransformedArticle[]
    )
  } catch (error) {
    console.error('Error transforming articles:', error)
    // Return empty arrays if transformation fails
  }

  const baseUrl = 'https://www.thecivicposts.com'
  
  // Structured data for SEO
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Civic Posts',
    url: baseUrl,
    description: 'Stay informed with the latest news, entertainment, sports, health & lifestyle, and editorial content',
    publisher: {
      '@type': 'Organization',
      name: 'The Civic Posts',
      url: baseUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'The Civic Posts',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add your social media URLs here when available
      // 'https://www.facebook.com/thecivicposts',
      // 'https://twitter.com/thecivicposts',
    ],
  }

  return (
    <AutoRefreshWrapper interval={30}>
      {/* Structured Data for SEO */}
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
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
    </AutoRefreshWrapper>
  )
}
