import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thecivicposts.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/entertainment`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sports`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/health-fitness`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/editorial`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/technology`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/automobiles`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Try to fetch articles, but don't fail if database is unavailable
  let articlePages: MetadataRoute.Sitemap = []
  
  try {
    // Connect to database
    await connectDB()

    // Current date for filtering out future-dated articles
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Dynamic article pages
    // Limit to most recent 10,000 articles for performance
    // Only include articles published today or earlier
    const articles = await Article.find({ 
      status: 'published',
      publishedDate: { $lte: currentDate } // Only show articles published today or earlier
    })
      .select('slug category updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10000)
      .lean()

    articlePages = articles.map((article) => ({
      url: `${baseUrl}/${article.category}/${article.slug}`,
      lastModified: article.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    // If database connection fails during build, just return static pages
    // This prevents build failures when MongoDB is unavailable
    console.error('Error fetching articles for sitemap:', error)
  }

  return [...staticPages, ...articlePages]
}
