import ArticleCard from './ArticleCard'

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

interface ArticlesGridProps {
  articles: Article[]
}

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No articles found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          title={article.title}
          subtitle={article.subtitle}
          mainImage={article.mainImage}
          publishedDate={article.publishedDate}
          authorName={article.authorName}
          slug={article.slug}
          category={article.category}
        />
      ))}
    </div>
  )
}
