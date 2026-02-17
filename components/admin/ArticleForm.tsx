'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import { formatDateShort } from '@/lib/date-utils'
import { renderFormattedText } from '@/lib/text-formatting'
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '@/lib/youtube-utils'
import { useToast } from '@/contexts/ToastContext'
import { getOptimizedImageUrl } from '@/lib/cloudinary-optimize'

interface Author {
  _id: string
  name: string
  email: string
}

interface ArticleFormProps {
  authors: Author[]
  article?: {
    _id: string
    title: string
    subtitle?: string
    content: string[]
    author: string
    publishedDate: string
    mainImage: { url: string; public_id: string; alt?: string }
    miniImage?: { url: string; public_id: string; alt?: string }
    youtubeLink?: string
    subImages: Array<{ url: string; public_id: string; alt?: string; order: number }>
    status: 'draft' | 'published'
    category: string
  }
  onPreviewChange?: (isPreview: boolean) => void
  isAuthor?: boolean
  isPublisher?: boolean
}

type FormDataState = {
  title: string
  subtitle: string
  content: string[]
  author: string
  publishedDate: string
  category: string
  status: 'draft' | 'published'
  mainImage: { url: string; public_id: string; alt: string }
  miniImage: { url: string; public_id: string; alt: string }
  youtubeLink: string
  subImages: Array<{ url: string; public_id: string; alt: string; order: number }>
}

export default function ArticleForm({ authors, article, onPreviewChange, isAuthor = false, isPublisher = false }: ArticleFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const textareaRef1 = useRef<HTMLTextAreaElement>(null)
  const textareaRef2 = useRef<HTMLTextAreaElement>(null)

  // Notify parent when preview state changes
  const handlePreviewToggle = (newPreviewState: boolean) => {
    setPreview(newPreviewState)
    onPreviewChange?.(newPreviewState)
  }
  const [formData, setFormData] = useState<FormDataState>({
    title: article?.title ?? '',
    subtitle: article?.subtitle ?? '',
    content: Array.isArray(article?.content) && article.content.length >= 2
      ? article.content.slice(0, 2).map((p: string) => p ?? '')
      : ['', ''],
    author: article?.author ?? '',
    publishedDate: article?.publishedDate
      ? new Date(article.publishedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    category: article?.category ?? 'news',
    status: article?.status ?? 'draft',
    mainImage: article?.mainImage ? {
      url: article.mainImage.url ?? '',
      public_id: article.mainImage.public_id ?? '',
      alt: article.mainImage.alt ?? '',
    } : { url: '', public_id: '', alt: '' },
    miniImage: article?.miniImage && article.miniImage.url ? {
      url: article.miniImage.url ?? '',
      public_id: article.miniImage.public_id ?? '',
      alt: article.miniImage.alt ?? '',
    } : { url: '', public_id: '', alt: '' },
    youtubeLink: article?.youtubeLink ?? '',
    subImages: Array.isArray(article?.subImages) 
      ? article.subImages.map(img => ({
          url: img.url ?? '',
          public_id: img.public_id ?? '',
          alt: img.alt ?? '',
          order: img.order ?? 0,
        }))
      : [],
  })

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track which option is selected: 'image', 'youtube', or 'none'
  const [mediaType, setMediaType] = useState<'image' | 'youtube' | 'none'>(() => {
    if (article?.miniImage?.url) return 'image'
    if (article?.youtubeLink) return 'youtube'
    return 'none'
  })

  // Helper function to count words
  const countWords = (text: string): number => {
    if (!text || !text.trim()) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Calculate total words across all paragraphs
  const getTotalWords = (): number => {
    return formData.content.reduce((total, paragraph) => total + countWords(paragraph || ''), 0)
  }

  const handleContentChange = (index: number, value: string) => {
    const currentContent = formData.content || ['', '']
    // Ensure we always have at least 2 paragraphs
    const newContent = currentContent.length >= 2 ? [...currentContent] : ['', '']
    newContent[index] = value
    setFormData({ ...formData, content: newContent })
  }

  const handleBoldFormat = (index: number) => {
    const textareaRef = index === 0 ? textareaRef1.current : textareaRef2.current
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const text = formData.content[index] || ''
    const selectedText = text.substring(start, end)

    let newText: string
    if (selectedText) {
      // If text is selected, wrap it with **
      newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end)
    } else {
      // If no text selected, insert **bold text**
      newText = text.substring(0, start) + '**bold text**' + text.substring(start)
    }

    handleContentChange(index, newText)

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newPosition = selectedText 
        ? start + selectedText.length + 4  // After **text**
        : start + 12  // After **bold text**
      textareaRef.setSelectionRange(newPosition, newPosition)
      textareaRef.focus()
    }, 0)
  }

  const handleImageUpload = async (file: File, imageType: 'main' | 'mini' | 'sub') => {
    setUploading(true)
    setError(null)

    try {
      // Step 1: Validate image dimensions for main image
      if (imageType === 'main') {
        const imageDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = document.createElement('img') as HTMLImageElement
            img.onload = () => {
              resolve({ width: img.width, height: img.height })
            }
            img.onerror = reject
            img.src = e.target?.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const { width, height } = imageDimensions
        const aspectRatio = width / height
        const requiredAspectRatio = 3 / 2 // 3:2 ratio
        const tolerance = 0.01 // Allow 1% tolerance for floating point errors

        // Check if dimensions match exactly 1200x800 or have correct 3:2 aspect ratio
        const isExactDimensions = width === 1200 && height === 800
        const hasCorrectAspectRatio = Math.abs(aspectRatio - requiredAspectRatio) <= tolerance

        if (!isExactDimensions && !hasCorrectAspectRatio) {
          setError(
            `Main image must be exactly 1200x800 pixels (3:2 aspect ratio). ` +
            `Your image is ${width}x${height} pixels (${aspectRatio.toFixed(2)}:1 ratio). ` +
            `Please resize your image to 1200x800 pixels before uploading.`
          )
          setUploading(false)
          return
        }

        // If aspect ratio is correct but dimensions are different, resize to exactly 1200x800
        if (!isExactDimensions && hasCorrectAspectRatio) {
          console.log(`Image has correct aspect ratio but wrong size. Resizing from ${width}x${height} to 1200x800`)
        }
      }

      // Step 2: Compress and resize image
      const compressionOptions = {
        maxSizeMB: 1, // Maximum file size in MB (1MB for production)
        maxWidthOrHeight: imageType === 'main' ? 1200 : 1920, // For main image, enforce 1200px width
        useWebWorker: true, // Use web worker for better performance
        initialQuality: 0.85, // 85% quality for good balance between size and quality
        alwaysKeepResolution: false, // Allow resizing if needed
      }

      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      const compressedFile = await imageCompression(file, compressionOptions)
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
      console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%')

      // Step 3: Convert to WebP format and resize to exact dimensions if main image
      const convertToWebP = (imageFile: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = document.createElement('img') as HTMLImageElement
            img.onload = () => {
              const canvas = document.createElement('canvas')
              
              // For main image, enforce exactly 1200x800 (3:2 ratio)
              if (imageType === 'main') {
                canvas.width = 1200
                canvas.height = 800
              } else {
                canvas.width = img.width
                canvas.height = img.height
              }
              
              const ctx = canvas.getContext('2d')
              if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
              }
              
              // Use high-quality scaling
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to convert to WebP'))
                    return
                  }
                  const webpFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '.webp'), {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  })
                  console.log('WebP file size:', (webpFile.size / 1024 / 1024).toFixed(2), 'MB')
                  if (imageType === 'main') {
                    console.log('Main image resized to exactly 1200x800 pixels')
                  }
                  resolve(webpFile)
                },
                'image/webp',
                0.85 // WebP quality
              )
            }
            img.onerror = reject
            img.src = e.target?.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(compressedFile)
        })
      }

      const webpFile = await convertToWebP(compressedFile)
      console.log('Final WebP file size:', (webpFile.size / 1024 / 1024).toFixed(2), 'MB')

      const uploadFormData = new FormData()
      uploadFormData.append('file', webpFile, webpFile.name)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (imageType === 'main') {
        setFormData((prev) => ({
          ...prev,
          mainImage: { url: data.url, public_id: data.public_id, alt: '' },
        }))
      } else if (imageType === 'mini') {
        setFormData((prev) => ({
          ...prev,
          miniImage: { url: data.url, public_id: data.public_id, alt: '' },
        }))
        setMediaType('image') // Set media type to image after upload
      } else {
        setFormData((prev) => {
          const currentSubImages = prev.subImages || []
          const newSubImages = [...currentSubImages]
          newSubImages.push({
            url: data.url,
            public_id: data.public_id,
            alt: '',
            order: newSubImages.length,
          })
          return { ...prev, subImages: newSubImages }
        })
      }
    } catch (err) {
      console.error('Image upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image. Please try again.'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!formData.title || !formData.title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    // Subtitle is optional

    if (!formData.author) {
      setError('Author is required')
      setLoading(false)
      return
    }

    if (!formData.mainImage.url) {
      setError('Main Image is required')
      setLoading(false)
      return
    }

    // Mini Image is optional

    // Validate that both paragraphs are filled
    if (!formData.content || formData.content.length < 2) {
      setError('Both paragraphs are required')
      setLoading(false)
      return
    }
    
    const filteredContent = formData.content.map(p => p?.trim() || '')
    if (filteredContent[0].length === 0 || filteredContent[1].length === 0) {
      setError('Both paragraphs are required (marked with *)')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        status: publish ? 'published' : 'draft',
        content: filteredContent,
        // Only include miniImage if it has a URL and no YouTube link
        miniImage: formData.miniImage?.url && !formData.youtubeLink?.trim() ? formData.miniImage : undefined,
        // Only include youtubeLink if it has a value and no mini image
        youtubeLink: formData.youtubeLink?.trim() && !formData.miniImage?.url ? formData.youtubeLink.trim() : undefined,
      }

      const apiBase = isPublisher ? '/api/publisher/articles' : (isAuthor ? '/api/author/articles' : '/api/admin/articles')
      const url = article
        ? `${apiBase}/${article._id}`
        : apiBase
      const method = article ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // Read response body once
      const contentType = response.headers.get('content-type') || ''
      let data: { article?: unknown; error?: string; success?: boolean } | null = null
      let errorText: string | null = null

      if (contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
          setError('Invalid JSON response from server')
          setLoading(false)
          return
        }
      } else {
        // If not JSON, read as text
        try {
          errorText = await response.text()
        } catch (textError) {
          console.error('Failed to read response text:', textError)
        }
      }

      // Check if response is ok
      if (!response.ok) {
        const errorMessage = data?.error || errorText || `Failed to save article: ${response.status} ${response.statusText}`
        console.error('API Error:', errorMessage, { status: response.status, data, errorText })
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Verify we got valid data
      if (!data || (!data.article && data.success === false)) {
        setError('Article was not saved successfully')
        showToast('Article was not saved successfully', 'error')
        setLoading(false)
        return
      }

      // Show success toast
      if (article) {
        showToast('Article updated successfully!', 'success')
      } else {
        showToast('Article created successfully!', 'success')
      }

      // Navigate on success
      const dashboardPath = isPublisher ? '/publisher/dashboard' : (isAuthor ? '/author/dashboard' : '/admin/dashboard')
      router.push(dashboardPath)
      router.refresh()
    } catch (err: unknown) {
      console.error('Error saving article:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save article. Please try again.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (preview) {
    const selectedAuthor = authors.find(a => a._id === formData.author)
    const authorName = selectedAuthor?.name || 'Unknown Author'
    const formattedDate = formData.publishedDate 
      ? formatDateShort(formData.publishedDate)
      : ''

    const categoryLabels: Record<string, string> = {
      'news': 'News',
      'entertainment': 'Entertainment',
      'sports': 'Sports',
      'health-fitness': 'Health & Life Style',
      'editorial': 'Editorial',
      'technology': 'Technology',
      'automobiles': 'Automobiles',
    }

    const categoryLabel = categoryLabels[formData.category] || formData.category

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mb-6 flex justify-end gap-4">
          <button
            onClick={() => handlePreviewToggle(false)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (article ? 'Updating...' : 'Publishing...') : (article ? 'Update Article' : 'Publish')}
          </button>
        </div>

        <article className="w-[92%] lg:w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Tag */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-orange-700 text-white text-xs md:text-sm font-semibold uppercase tracking-wide">
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-merriweather leading-tight">
            {formData.title || 'Untitled Article'}
          </h1>

          {/* Subtitle */}
          {formData.subtitle && (
            <h2 className="text-xl md:text-2xl text-gray-700 font-semibold mb-6 font-merriweather leading-relaxed">
              {formData.subtitle}
            </h2>
          )}

          {/* Author and Date */}
          <div className="mb-6">
            <p className="text-base md:text-lg text-gray-600 font-sans">
              {authorName} - {formattedDate}
            </p>
          </div>

          {/* Main Image */}
          {formData.mainImage.url && (
            <div className="mb-8">
              <Image
                src={getOptimizedImageUrl(formData.mainImage.url, 1200, 'auto:best')}
                alt={formData.mainImage.alt || formData.title || 'Article main image'}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg"
                priority
                quality={90}
              />
            </div>
          )}

          {/* Content */}
          <div className="max-w-none">
            {/* First Paragraph */}
            {formData.content[0] && formData.content[0].trim() && (
              <div className="mb-6">
                {formData.content[0].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-lg md:text-xl font-merriweather font-normal">
                    {renderFormattedText(line.trim())}
                  </p>
                ))}
              </div>
            )}

            {/* YouTube Video or Mini Image (Only One) */}
            {formData.youtubeLink && (() => {
              const videoId = extractYouTubeVideoId(formData.youtubeLink)
              if (videoId) {
                return (
                  <div className="mb-8">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={getYouTubeEmbedUrl(videoId)}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                      />
                    </div>
                  </div>
                )
              }
              return null
            })()}
            
            {/* Mini Image - Only show if no YouTube link */}
            {!formData.youtubeLink && formData.miniImage?.url && (
              <div className="mb-8">
                <Image
                  src={getOptimizedImageUrl(formData.miniImage.url, 800, 'auto:best')}
                  alt={formData.miniImage.alt || 'Mini image'}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  quality={85}
                />
              </div>
            )}

            {/* Second Paragraph */}
            {formData.content[1] && formData.content[1].trim() && (
              <div className="mb-6">
                {formData.content[1].split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-5 text-gray-800 leading-relaxed text-lg md:text-xl font-merriweather font-normal">
                    {renderFormattedText(line.trim())}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Sub Images */}
          {(formData.subImages || []).length > 0 && (
            <div className="mt-12 space-y-8">
              {(formData.subImages || [])
                .sort((a, b) => a.order - b.order)
                .map((img, idx) => (
                  <div key={idx}>
                    <Image
                      src={getOptimizedImageUrl(img.url, 1200, 'auto:best')}
                      alt={img.alt || `Article image ${idx + 1}`}
                      width={1200}
                      height={600}
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
    )
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-lg shadow-lg p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Side - All Fields */}
        <div className="space-y-6 flex flex-col min-w-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <textarea
              value={formData.title || ''}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value })
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-y min-h-[60px]"
              placeholder="Enter article title"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              value={formData.subtitle || ''}
              onChange={(e) => {
                setFormData({ ...formData, subtitle: e.target.value })
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-y min-h-[60px]"
              placeholder="Enter subtitle"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category || 'news'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="news">News</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports</option>
              <option value="health-fitness">Health & Life Style</option>
              <option value="editorial">Editorial</option>
              <option value="technology">Technology</option>
              <option value="automobiles">Automobiles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <select
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Select an author</option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Published Date *
            </label>
            <input
              type="date"
              value={formData.publishedDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image *
                    </label>
                    <p className="text-xs text-orange-600 font-semibold mb-2">
                      ⚠️ Required: Exactly 1200x800 pixels (3:2 aspect ratio)
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Images will be automatically resized to 1200x800 if they have the correct 3:2 ratio.
                      Images with incorrect aspect ratios will be rejected.
                    </p>
            {formData.mainImage.url ? (
              <div className="relative">
                <Image
                  src={formData.mainImage.url}
                  alt={formData.mainImage.alt || formData.title || 'Article main image'}
                  width={400}
                  height={267}
                  className="max-w-md max-h-64 w-auto h-auto rounded-lg mb-2 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mainImage: { url: '', public_id: '', alt: '' } })}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'main')
                }}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>
        </div>

          {/* Right Side - Description */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <span className="text-sm font-semibold text-gray-600">
              Total Words: <span className="text-orange-600">{getTotalWords()}</span>
            </span>
          </div>
          
          {/* First Paragraph */}
          <div className="mb-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paragraph 1 <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  ({countWords(formData.content[0] || '')} words)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleBoldFormat(0)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-bold transition-colors"
                title="Make selected text bold (or insert bold text)"
              >
                B
              </button>
            </div>
            <textarea
              ref={textareaRef1}
              value={formData.content[0] || ''}
              onChange={(e) => handleContentChange(0, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-y min-h-[200px]"
              placeholder="Enter first paragraph..."
              rows={10}
              required
            />
          </div>

          {/* Mini Image or YouTube Video (Optional - Choose one only or leave both empty) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mini Image or YouTube Video <span className="text-gray-500 text-xs">(Optional - Choose one only or leave empty)</span>
            </label>
            
            {/* Toggle between Mini Image and YouTube Link */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMediaType('image')
                  setFormData({ 
                    ...formData, 
                    youtubeLink: '', // Clear YouTube link when selecting image
                  })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === 'image'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mini Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('youtube')
                  setFormData({ 
                    ...formData, 
                    miniImage: { url: '', public_id: '', alt: '' }, // Clear image when selecting YouTube
                  })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === 'youtube'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                YouTube Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('none')
                  setFormData({ 
                    ...formData, 
                    miniImage: { url: '', public_id: '', alt: '' },
                    youtubeLink: '',
                  })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === 'none'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                None
              </button>
            </div>

            {/* Mini Image Section - Show when image is selected */}
            {mediaType === 'image' && (
              <div>
                {formData.miniImage?.url ? (
                  <div className="relative">
                    <Image
                      src={formData.miniImage.url}
                      alt={formData.miniImage.alt || 'Mini image'}
                      width={400}
                      height={300}
                      className="max-w-md max-h-64 w-auto h-auto rounded-lg mb-2 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, miniImage: { url: '', public_id: '', alt: '' } })
                        setMediaType('none')
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'mini')
                    }}
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
            )}

            {/* YouTube Link Section - Show when YouTube is selected */}
            {mediaType === 'youtube' && (
              <div>
                <input
                  type="text"
                  value={formData.youtubeLink || ''}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste YouTube URL (full URL or short URL)
                </p>
                {formData.youtubeLink && (() => {
                  const videoId = extractYouTubeVideoId(formData.youtubeLink)
                  if (videoId) {
                    return (
                      <div className="mt-4 relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={getYouTubeEmbedUrl(videoId)}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video preview"
                        />
                      </div>
                    )
                  }
                  return null
                })()}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, youtubeLink: '' })
                    setMediaType('none')
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove YouTube Link
                </button>
              </div>
            )}
          </div>

          {/* Second Paragraph */}
          <div className="mb-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paragraph 2 <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  ({countWords(formData.content[1] || '')} words)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleBoldFormat(1)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-bold transition-colors"
                title="Make selected text bold (or insert bold text)"
              >
                B
              </button>
            </div>
            <textarea
              ref={textareaRef2}
              value={formData.content[1] || ''}
              onChange={(e) => handleContentChange(1, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-y min-h-[200px]"
              placeholder="Enter second paragraph..."
              rows={10}
              required
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={() => handlePreviewToggle(true)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Preview
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? (article ? 'Updating...' : 'Publishing...') : (article ? 'Update Article' : 'Publish')}
          </button>
        </div>
    </form>
  )
}
