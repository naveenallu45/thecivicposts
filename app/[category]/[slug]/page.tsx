import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Image from 'next/image'
import SocialShare from '@/components/SocialShare'
import { formatDateShort } from '@/lib/date-utils'
import { renderFormattedText } from '@/lib/text-formatting'
import { generateAuthorSlug, formatAuthorName } from '@/lib/author-utils'
import { extractYouTubeVideoId } from '@/lib/youtube-utils'
import MoreArticles from '@/components/MoreArticles'
import ViewportPrefetch from '@/components/ViewportPrefetch'
import YouTubeVideo from '@/components/YouTubeVideo'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleListItem } from '@/lib/article-types'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

// ISR: Revalidate every 60 seconds (1 minute)
// Pages will be statically generated and revalidated in the background
// This ensures pages are cached and served instantly after first generation
export const revalidate = 60

// Enable dynamic params for better performance
export const dynamicParams = true

// Production-level caching: Use static generation with revalidation
export const dynamic = 'force-static'

// Generate static params for better performance (optional - can be removed if you have too many articles)
// export async function generateStaticParams() {
//   // This pre-generates pages at build time for better performance
//   // Only enable if you have a manageable number of articles
// }

// Generate metadata for social media sharing (Open Graph & Twitter Cards)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  await connectDB()
  
  const { category, slug } = await params
  
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  const article = await Article.findOne({ 
    slug, 
    status: 'published',
    publishedDate: { $lte: currentDate } // Only show articles published today or earlier
  })
    .select('title subtitle content mainImage publishedDate authorName category')
    .lean()

  if (!article) {
    return {
      title: 'Article Not Found - The Civic Posts',
    }
  }

  // Verify category matches
  if (article.category !== category) {
    return {
      title: 'Article Not Found - The Civic Posts',
    }
  }

  const baseUrl = 'https://www.thecivicposts.com'
  const articleUrl = `${baseUrl}/${category}/${slug}`
  const siteName = 'www.thecivicposts.com'
  
  // Get description from subtitle or first paragraph of content
  const description = article.subtitle || 
    (article.content && Array.isArray(article.content) && article.content.length > 0 && article.content[0] 
      ? article.content[0].substring(0, 160).replace(/\n/g, ' ').trim() + '...'
      : 'Read the full article on The Civic Posts')
  
  // Get image URL - use main image if available, ensure it's absolute
  let absoluteImageUrl = article.mainImage?.url || ''
  
  // Ensure image URL is absolute (Cloudinary URLs are already absolute)
  if (absoluteImageUrl && !absoluteImageUrl.startsWith('http')) {
    absoluteImageUrl = `${baseUrl}${absoluteImageUrl}`
  }
  
  // If no image, use a default OG image
  if (!absoluteImageUrl) {
    absoluteImageUrl = `${baseUrl}/og-image.jpg`
  }

  return {
    title: article.title,
    description: description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: article.title,
      description: description,
      url: articleUrl,
      siteName: siteName,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 800,
          alt: article.mainImage?.alt || article.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: article.publishedDate?.toISOString(),
      authors: [article.authorName || 'The Civic Posts'],
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '800',
      'og:image:type': 'image/jpeg',
      'article:author': article.authorName || 'The Civic Posts',
      'article:published_time': article.publishedDate?.toISOString() || '',
      'article:section': article.category,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  try {
    const { category, slug } = await params
    
    // Connect to DB (cached connection)
    await connectDB()
  
  const categoryLabels: Record<string, string> = {
    'news': 'News',
    'entertainment': 'Entertainment',
    'sports': 'Sports',
    'health-fitness': 'Health & Life Style',
    'editorial': 'Editorial',
    'technology': 'Technology',
    'automobiles': 'Automobiles',
  }
  
  // Current date for filtering out future-dated articles
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

  // Fetch article (ISR will cache this page)
  // Optimized: Only select needed fields for better performance
  // Using lean() for faster queries (returns plain JS objects)
  // Filter out articles with future publishedDate
  const article = await Article.findOne({ 
    slug, 
    status: 'published',
    publishedDate: { $lte: currentDate } // Only show articles published today or earlier
  })
    .select('title subtitle content mainImage miniImage youtubeLink subImages publishedDate authorName category slug updatedAt')
    .lean()
    .exec()

  if (!article) {
    // Article not found - return proper 404 status
    // Redirect to category page after a short delay for better UX
    notFound()
  }

  // Verify category matches - redirect to correct category
  if (article.category !== category) {
    redirect(`/${article.category}/${article.slug}`)
  }

  const authorName = article.authorName || 'Unknown'

  const publishedDate = article.publishedDate
    ? formatDateShort(article.publishedDate)
    : ''

  const categoryLabel = categoryLabels[article.category] || article.category
  
  // Fetch initial "More Articles" (same category only, excluding current article)
  const [moreArticles, totalMoreArticles, recentArticles] = await Promise.all([
    Article.find({ 
      status: 'published',
      category: article.category, // Only same category
      publishedDate: { $lte: currentDate },
      slug: { $ne: slug } // Exclude current article
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean() as Promise<ArticleListItem[]>,
    Article.countDocuments({ 
      status: 'published',
      category: article.category, // Only same category
      publishedDate: { $lte: currentDate },
      slug: { $ne: slug }
    }),
    // Fetch recent articles from all categories (for bottom section) - fetch more to show multiple rows
    Article.find({ 
      status: 'published',
      publishedDate: { $lte: currentDate },
      slug: { $ne: slug } // Exclude current article
    })
      .sort({ createdAt: -1 })
      .limit(20) // Fetch 20 articles to show multiple rows (5 rows x 4 columns)
      .select('title subtitle mainImage publishedDate authorName slug category')
      .lean() as Promise<ArticleListItem[]>
  ])

  const moreArticlesData = moreArticles.map((article) => ({
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
  }))

  const recentArticlesData = recentArticles.map((article) => ({
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
  }))
  
  // Construct the full article URL for sharing with category
  const baseUrl = 'https://www.thecivicposts.com'
  const articleUrl = `${baseUrl}/${category}/${slug}`
  
  // Get absolute image URL
  let absoluteImageUrl = article.mainImage?.url || ''
  if (absoluteImageUrl && !absoluteImageUrl.startsWith('http')) {
    absoluteImageUrl = `${baseUrl}${absoluteImageUrl}`
  }

  // Generate structured data (JSON-LD) for better SEO and social sharing
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.subtitle || (article.content && article.content[0] ? article.content[0].substring(0, 200) : ''),
    image: absoluteImageUrl || undefined,
    url: articleUrl, // Explicitly include URL
    datePublished: article.publishedDate?.toISOString(),
    dateModified: article.updatedAt?.toISOString() || article.publishedDate?.toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Civic Posts',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl, // Ensure URL is in mainEntityOfPage
    },
  }

  return (
    <>
      {/* Preload main image for faster loading via CDN */}
      {article.mainImage?.url && (
        <link
          rel="preload"
          as="image"
          href={getOptimizedImageUrl(article.mainImage.url, 1200, 'auto:best')}
          fetchPriority="high"
        />
      )}
      {/* Structured Data (JSON-LD) for SEO and Social Sharing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-gray-50 animate-fade-in-up">
        <div className="w-[95%] lg:w-[85%] mx-auto px-2 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/${category}`}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium text-sm md:text-base">Back to {categoryLabel}</span>
            </Link>
          </div>

          {/* Layout: Article content on left, More Articles sidebar on right (laptop) */}
          <div className="lg:flex lg:gap-8 lg:items-stretch">
            {/* Main Article Content - Left Column */}
            <article className="lg:flex-1">
              {/* Category Tag */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-orange-700 text-white text-xs md:text-sm font-semibold uppercase tracking-wide">
                  {categoryLabel}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[22px] md:text-5xl lg:text-[32.4px] font-bold text-gray-900 mb-4 font-merriweather leading-tight">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <h2 className="text-[12px] md:text-2xl text-gray-700 font-semibold mb-6 font-merriweather leading-relaxed">
                  {article.subtitle}
                </h2>
              )}

              {/* Author and Date */}
              <div className="mb-6">
                <p className="text-base md:text-lg text-gray-600 font-sans">
                  <Link 
                    href={`/author/${generateAuthorSlug(authorName)}`}
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    {formatAuthorName(authorName)}
                  </Link>
                  {' - '}
                  {publishedDate}
                </p>
              </div>

              {/* Social Share */}
              <SocialShare 
                title={article.title} 
                url={articleUrl} 
              />

              {/* Main Image - HD Quality via CDN */}
              {article.mainImage?.url && article.mainImage.url.trim() && (
                <div className="mb-8 lg:w-3/4 lg:mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(() => {
                      try {
                        return getOptimizedImageUrl(article.mainImage.url, 1200, 'auto:best')
                      } catch (error) {
                        console.error('Error optimizing image URL, using raw URL:', error)
                        return article.mainImage.url
                      }
                    })()}
                    alt={article.mainImage.alt || article.title || 'Article image'}
                    className="w-full h-auto rounded-lg image-fade-in"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              )}

              {/* Content */}
              <div className="max-w-none">
                {/* First Paragraph */}
                {article.content && article.content[0] && article.content[0].trim() && (
                  <div className="mb-6">
                    {article.content[0].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                      <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-[13.5px] md:text-xl font-merriweather font-normal">
                        {renderFormattedText(line.trim())}
                      </p>
                    ))}
                  </div>
                )}

                {/* YouTube Video or Mini Image (Only One) */}
                {(article.youtubeLink as string | undefined) && (() => {
                  const youtubeLink = article.youtubeLink as string
                  const videoId = extractYouTubeVideoId(youtubeLink)
                  if (videoId) {
                    return <YouTubeVideo videoId={videoId} title={article.title} />
                  }
                  // If youtubeLink exists but videoId extraction failed, show error message
                  return (
                    <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        Invalid YouTube URL format. Please check the link: {youtubeLink}
                      </p>
                    </div>
                  )
                })()}
                
                {/* Mini Image - HD Quality via CDN - Only show if no YouTube link */}
                {!article.youtubeLink && article.miniImage?.url && (
                  <div className="mb-8 lg:w-3/4 lg:mx-auto">
                    <Image
                      src={getOptimizedImageUrl(article.miniImage.url, 800, 'auto:best')}
                      alt={article.miniImage.alt || article.title || 'Mini image'}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                      loading="lazy"
                      quality={90}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 600px"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                )}

                {/* Second Paragraph */}
                {article.content && article.content[1] && article.content[1].trim() && (
                  <div className="mb-6">
                    {article.content[1].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                      <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-[13.5px] md:text-xl font-merriweather font-normal">
                        {renderFormattedText(line.trim())}
                      </p>
                    ))}
                  </div>
                )}

                {/* Additional paragraphs (if any) */}
                {article.content && article.content.length > 2 && article.content.slice(2).map((para, idx) => {
                  if (!para || !para.trim()) return null
                  const lines = para.split('\n').filter(line => line.trim())
                  return (
                    <div key={idx + 2} className="mb-6">
                      {lines.map((line, lineIdx) => (
                        <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-[13.5px] md:text-xl font-merriweather font-normal">
                          {renderFormattedText(line.trim())}
                        </p>
                      ))}
                    </div>
                  )
                })}
              </div>

              {/* Sub Images - HD Quality via CDN */}
              {(article.subImages || []).length > 0 && (
                <div className="mt-12 space-y-8">
                  {(article.subImages || [])
                    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
                    .map((img: { url: string; alt?: string }, idx: number) => (
                      <div key={idx} className="lg:w-3/4 lg:mx-auto">
                        <Image
                          src={getOptimizedImageUrl(img.url, 1200, 'auto:best')}
                          alt={img.alt || `Article image ${idx + 1}`}
                          width={1200}
                          height={600}
                          className="w-full h-auto rounded-lg"
                          loading="lazy"
                          quality={90}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 900px"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* More Articles Section - Mobile: Show at bottom */}
              <div className="lg:hidden mt-16 pt-12 border-t border-gray-300">
                <ViewportPrefetch articles={moreArticlesData} />
                <MoreArticles 
                  initialArticles={moreArticlesData}
                  excludeSlug={slug}
                  totalArticles={totalMoreArticles}
                  category={article.category}
                />
              </div>
            </article>

            {/* More Articles Sidebar - Laptop: Right Column - Matches article height */}
            <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0 lg:flex lg:flex-col">
              <div className="lg:sticky lg:top-8 lg:h-full">
                <ViewportPrefetch articles={moreArticlesData} />
                <MoreArticles 
                  initialArticles={moreArticlesData}
                  excludeSlug={slug}
                  totalArticles={totalMoreArticles}
                  sidebar={true}
                  category={article.category}
                />
              </div>
            </aside>
          </div>

          {/* Recent Articles Section - Below Full Article (Laptop: 4 in a row) */}
          <div className="mt-16 pt-12 border-t border-gray-300">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-merriweather">
              Recent Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArticlesData.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  mainImage={article.mainImage}
                  publishedDate={article.publishedDate}
                  authorName={article.authorName}
                  slug={article.slug}
                  category={article.category}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
  } catch (error) {
    console.error('Error rendering article page:', error)
    throw error // Re-throw to show 500 error page
  }
}
