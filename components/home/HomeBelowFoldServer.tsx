import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import TrendingSection from '@/components/TrendingSection'
import CategorySection from '@/components/CategorySection'
import { SITE_CATEGORIES } from '@/lib/site-categories'
import {
  transformHomeArticle,
  type HomeArticleDocument,
  type HomeTransformedArticle,
} from '@/lib/home-articles'

export default async function HomeBelowFoldServer() {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  let trendingData: HomeTransformedArticle[] = []
  let categoryData: HomeTransformedArticle[][] = []

  try {
    await connectDB()
    const results = await Promise.all([
      Article.find({
        status: 'published',
        isTrending: true,
        publishedDate: { $lte: currentDate },
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      ...SITE_CATEGORIES.map((cat) =>
        Article.find({
          status: 'published',
          category: cat.key,
          publishedDate: { $lte: currentDate },
          isTopStory: { $ne: true },
          isMiniTopStory: { $ne: true },
          isTrending: { $ne: true },
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .select('title subtitle mainImage publishedDate authorName slug category')
          .lean()
      ),
    ])

    const trendingArticles = results[0] as HomeArticleDocument[]
    const categoryArticles = results.slice(1) as HomeArticleDocument[][]

    trendingData = trendingArticles
      .map(transformHomeArticle)
      .filter(Boolean) as HomeTransformedArticle[]
    categoryData = categoryArticles.map((articles) =>
      articles.map(transformHomeArticle).filter(Boolean)
    ) as HomeTransformedArticle[][]
  } catch (error) {
    console.error('HomeBelowFoldServer:', error)
  }

  return (
    <>
      <TrendingSection articles={trendingData} />
      {SITE_CATEGORIES.map((cat, index) => (
        <CategorySection
          key={cat.key}
          articles={categoryData[index] || []}
          categoryName={cat.name}
        />
      ))}
    </>
  )
}
