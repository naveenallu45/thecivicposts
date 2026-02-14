import TopStoriesCarousel from './TopStoriesCarousel'
import MiniTopStoryCard from './MiniTopStoryCard'
import SectionHeading from './SectionHeading'

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
  if (topStories.length === 0 && miniTopStories.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <SectionHeading title="Top Stories" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
              <MiniTopStoryCard
                key={article.id}
                title={article.title}
                mainImage={article.mainImage}
                publishedDate={article.publishedDate}
                authorName={article.authorName}
                slug={article.slug}
                category={article.category}
              />
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
