import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import TopStoriesSection from '@/components/TopStoriesSection'
import {
  transformHomeArticle,
  type HomeArticleDocument,
  type HomeTransformedArticle,
} from '@/lib/home-articles'

export default async function HomeTopStoriesServer() {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  let topStoriesData: HomeTransformedArticle[] = []
  let miniTopStoriesData: HomeTransformedArticle[] = []

  try {
    await connectDB()
    const [topStories, miniTopStories] = await Promise.all([
      Article.find({
        status: 'published',
        isTopStory: true,
        publishedDate: { $lte: currentDate },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
      Article.find({
        status: 'published',
        isMiniTopStory: true,
        publishedDate: { $lte: currentDate },
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('title subtitle mainImage publishedDate authorName slug category')
        .lean(),
    ])

    topStoriesData = (topStories as HomeArticleDocument[])
      .map(transformHomeArticle)
      .filter(Boolean) as HomeTransformedArticle[]
    miniTopStoriesData = (miniTopStories as HomeArticleDocument[])
      .map(transformHomeArticle)
      .filter(Boolean) as HomeTransformedArticle[]
  } catch (error) {
    console.error('HomeTopStoriesServer:', error)
  }

  return <TopStoriesSection topStories={topStoriesData} miniTopStories={miniTopStoriesData} />
}
