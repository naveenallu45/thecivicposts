import ArticleCard from './ArticleCard'
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

interface CategorySectionProps {
  articles: Article[]
  categoryName: string
}

export default function CategorySection({ articles, categoryName }: CategorySectionProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <SectionHeading title={categoryName} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
    </div>
  )
}
