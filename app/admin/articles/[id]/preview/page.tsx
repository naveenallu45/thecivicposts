import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Image from 'next/image'
import Link from 'next/link'
import { formatDateShort } from '@/lib/date-utils'
import { renderFormattedText } from '@/lib/text-formatting'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

export const dynamic = 'force-dynamic'

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  await connectDB()

  const { id } = await params
  // authorName is already stored in article, no populate needed
  // Ensure miniImage is included in the query
  const article = await Article.findById(id)
    .select('title subtitle content mainImage miniImage subImages publishedDate authorName category slug')
    .lean()

  if (!article) {
    redirect('/admin/articles')
  }

  // Use stored authorName directly (no populate needed)
  const author = article.authorName || 'Unknown Author'

  const formattedDate = article.publishedDate
    ? formatDateShort(article.publishedDate)
    : ''

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Article Preview</h1>
            <div className="flex gap-4">
              <Link
                href={`/admin/articles/${id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Article
              </Link>
              <Link
                href="/admin/articles"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Articles
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-lg p-8">
          {/* Main Image */}
          {article.mainImage?.url && (
            <div className="mb-6 flex justify-center">
              <Image
                src={getOptimizedImageUrl(article.mainImage.url, 800)}
                alt={article.mainImage.alt || article.title || 'Article main image'}
                width={800}
                height={400}
                className="w-auto max-w-full max-h-96 h-auto rounded-lg object-contain"
                loading="lazy"
                quality={85}
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold mb-2 text-gray-900 font-serif">
            {article.title || 'Untitled Article'}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <h2 className="text-xl text-gray-700 font-semibold mb-4">{article.subtitle}</h2>
          )}

          {/* Author Name and Date */}
          <div className="mb-6 text-gray-600">
            <p className="text-sm">
              By <span className="font-semibold text-gray-900">{author}</span>
              {formattedDate && (
                <> • <span>{formattedDate}</span></>
              )}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            {/* First Paragraph */}
            {article.content && article.content[0] && article.content[0].trim() && (
              <div className="mb-4">
                {article.content[0].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-2 text-gray-700 leading-relaxed">
                    {renderFormattedText(line.trim())}
                  </p>
                ))}
              </div>
            )}

            {/* Mini Image - Display between first and second paragraph */}
            {article.miniImage?.url && (
              <div className="mb-6 flex justify-center">
                <Image
                  src={getOptimizedImageUrl(article.miniImage.url, 800)}
                  alt={article.miniImage.alt || article.title || 'Mini image'}
                  width={800}
                  height={600}
                  className="w-full max-w-2xl h-auto rounded-lg"
                  loading="lazy"
                  quality={85}
                />
              </div>
            )}

            {/* Second Paragraph */}
            {article.content && article.content[1] && article.content[1].trim() && (
              <div className="mb-4">
                {article.content[1].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-2 text-gray-700 leading-relaxed">
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
                <div key={idx + 2} className="mb-4">
                  {lines.map((line, lineIdx) => (
                    <p key={lineIdx} className="mb-2 text-gray-700 leading-relaxed">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Sub Images */}
          {(article.subImages || []).length > 0 && (
            <div className="mt-8">
              {(article.subImages || []).map((img, idx) => (
                <div key={idx} className="my-6">
                  <Image
                    src={getOptimizedImageUrl(img.url, 800)}
                    alt={img.alt || `Article image ${idx + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                    quality={85}
                  />
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </>
  )
}
