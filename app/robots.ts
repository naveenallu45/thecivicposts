import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.thecivicposts.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/publisher/', '/api/publisher/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
