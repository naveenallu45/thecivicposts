import { notFound } from 'next/navigation'
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

// ISR: Revalidate every 60 seconds (1 minute)
// Pages will be statically generated and revalidated in the background
// This ensures pages are cached and served instantly after first generation
export const revalidate = 60

// Enable dynamic params for better performance
export const dynamicParams = true

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
  const article = await Article.findOne({ slug, status: 'published' })
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
  const { category, slug } = await params
  
  // Connect to DB (cached connection)
  await connectDB()
  
  // Fetch article (ISR will cache this page)
  // Optimized: Only select needed fields for better performance
  // Using lean() for faster queries (returns plain JS objects)
  const article = await Article.findOne({ slug, status: 'published' })
    .select('title subtitle content mainImage miniImage subImages publishedDate authorName category slug updatedAt')
    .lean()
    .exec()

  if (!article) {
    notFound()
  }

  // Verify category matches
  if (article.category !== category) {
    notFound()
  }

  const authorName = article.authorName || 'Unknown'

  const publishedDate = article.publishedDate
    ? formatDateShort(article.publishedDate)
    : ''

  const categoryLabels: Record<string, string> = {
    'news': 'News',
    'entertainment': 'Entertainment',
    'sports': 'Sports',
    'health-fitness': 'Health & Fitness',
    'editorial': 'Editorial',
  }

  const categoryLabel = categoryLabels[article.category] || article.category
  
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
      {/* Structured Data (JSON-LD) for SEO and Social Sharing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-gray-50">
        <article className="w-[95%] lg:w-[85%] mx-auto px-2 sm:px-6 lg:px-8 py-12">
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

        {/* Category Tag */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-orange-700 text-white text-xs md:text-sm font-semibold uppercase tracking-wide">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[22px] md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-merriweather leading-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <h2 className="text-xl md:text-2xl text-gray-700 font-semibold mb-6 font-merriweather leading-relaxed">
            {article.subtitle}
          </h2>
        )}

        {/* Author and Date */}
        <div className="mb-6">
          <p className="text-base md:text-lg text-gray-600 font-sans">
            {authorName} - {publishedDate}
          </p>
        </div>

        {/* Social Share */}
        <SocialShare 
          title={article.title} 
          url={articleUrl} 
        />

        {/* Main Image */}
        {article.mainImage?.url && (
          <div className="mb-8">
            <Image
              src={article.mainImage.url}
              alt={article.mainImage.alt || article.title || 'Article image'}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-none">
          {/* First Paragraph */}
          {article.content && article.content[0] && article.content[0].trim() && (
            <div className="mb-6">
              {article.content[0].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-lg md:text-xl font-merriweather font-normal">
                  {renderFormattedText(line.trim())}
                </p>
              ))}
            </div>
          )}

          {/* Mini Image */}
          {article.miniImage?.url && (
            <div className="mb-8">
              <Image
                src={article.miniImage.url}
                alt={article.miniImage.alt || article.title || 'Mini image'}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            </div>
          )}

          {/* Second Paragraph */}
          {article.content && article.content[1] && article.content[1].trim() && (
            <div className="mb-6">
              {article.content[1].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-lg md:text-xl font-merriweather font-normal">
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
                  <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-lg md:text-xl font-merriweather font-normal">
                    {renderFormattedText(line.trim())}
                  </p>
                ))}
              </div>
            )
          })}
        </div>

        {/* Sub Images */}
        {(article.subImages || []).length > 0 && (
          <div className="mt-12 space-y-8">
            {(article.subImages || [])
              .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
              .map((img: { url: string; alt?: string }, idx: number) => (
                <div key={idx}>
                  <Image
                    src={img.url}
                    alt={img.alt || `Article image ${idx + 1}`}
                    width={1200}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </div>
              ))}
          </div>
        )}
      </article>
    </main>
    </>
  )
}
