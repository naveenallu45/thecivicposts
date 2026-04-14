import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requirePublisherApi } from '@/lib/publisher-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import Publisher from '@/models/Publisher'
import { queryCache } from '@/lib/query-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePublisherApi()
    await connectDB()

    const { id } = await params
    
    // Get publisher's ObjectId
    const publisher = await Publisher.findOne({ email: session.email })
    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      )
    }

    const article = await Article.findOne({
      _id: id,
      publisher: publisher._id, // Ensure publisher owns this article
    })
      .populate('author', 'name email')
      .lean()

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePublisherApi()
    await connectDB()

    const { id } = await params
    
    // Get publisher's ObjectId
    const publisher = await Publisher.findOne({ email: session.email })
    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      )
    }

    // Check if article exists and belongs to this publisher
    const existingArticle = await Article.findOne({
      _id: id,
      publisher: publisher._id,
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      content,
      author,
      publishedDate,
      mainImage,
      mainImages,
      miniImage,
      miniImages,
      youtubeLink,
      youtubeLinks,
      subImages,
      status,
      category,
    } = body

    // Get author name if author changed
    let authorName = existingArticle.authorName
    if (author && author !== existingArticle.author.toString()) {
      const authorDoc = await Author.findById(author)
      if (!authorDoc) {
        return NextResponse.json(
          { error: 'Author not found' },
          { status: 400 }
        )
      }
      authorName = authorDoc.name
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug
    if (title && title !== existingArticle.title) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      if (slug.length > 200) {
        slug = slug.substring(0, 200).replace(/-+$/, '')
      }
    }

    const normalizedYoutubeLinks: string[] = Array.isArray(youtubeLinks)
      ? youtubeLinks.map((link: unknown) => String(link || '').trim()).filter(Boolean)
      : (youtubeLink ? [String(youtubeLink).trim()] : [])
    const normalizedMainImages = (Array.isArray(mainImages) ? mainImages : (mainImage ? [mainImage] : []))
      .filter((img: unknown) => Boolean((img as { url?: string; public_id?: string })?.url && (img as { url?: string; public_id?: string })?.public_id))
      .slice(0, 4)
    const normalizedMiniImages = (Array.isArray(miniImages) ? miniImages : (miniImage ? [miniImage] : []))
      .filter((img: unknown) => Boolean((img as { url?: string; public_id?: string })?.url && (img as { url?: string; public_id?: string })?.public_id))
      .slice(0, 4)

    const nextStatus = status !== undefined ? status : existingArticle.status
    let nextPublishedAt = existingArticle.publishedAt
    if (existingArticle.status === 'draft' && nextStatus === 'published') {
      nextPublishedAt = new Date()
    } else if (nextStatus === 'published' && !nextPublishedAt) {
      nextPublishedAt = new Date()
    } else if (nextStatus === 'draft') {
      nextPublishedAt = undefined
    }

    const updateData: {
      title?: string
      subtitle?: string
      content?: string[]
      author?: typeof author
      authorName?: string
      publishedDate?: Date
      mainImage?: { url: string; public_id: string; alt?: string } | undefined
      mainImages?: Array<{ url: string; public_id: string; alt?: string }>
      miniImage?: { url: string; public_id: string; alt?: string }
      miniImages?: Array<{ url: string; public_id: string; alt?: string }>
      youtubeLink?: string
      youtubeLinks?: string[]
      subImages?: Array<{ url: string; public_id: string; alt?: string; order: number }>
      status?: 'draft' | 'published'
      category?: string
      slug?: string
      publishedAt?: Date
    } = {
      title,
      subtitle: subtitle?.trim() || undefined, // Subtitle is optional
      content,
      publishedDate: new Date(publishedDate),
      mainImage: normalizedMainImages[0] || undefined,
      mainImages: normalizedMainImages,
      miniImage: normalizedMiniImages[0] || undefined,
      miniImages: normalizedMiniImages,
      youtubeLink: normalizedYoutubeLinks[0] || undefined,
      youtubeLinks: normalizedYoutubeLinks,
      subImages: subImages || [],
      status,
      category,
      slug,
      publishedAt: nextPublishedAt,
    }
    if (author) {
      updateData.author = author
      updateData.authorName = authorName
    }

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      )
    }

    // Clear query cache after updating article
    queryCache.clear('article:')
    queryCache.clear('author:')
    queryCache.clear('articles:all:')

    // Revalidate home page if article is published or has home page flags
    if (status === 'published' || article.isTopStory || article.isMiniTopStory || article.isLatest || article.isTrending) {
      revalidatePath('/', 'page')
      if (category) {
        revalidatePath(`/${category}`, 'page')
      }
    }

    return NextResponse.json({ article })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update article'
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePublisherApi()
    await connectDB()

    const { id } = await params
    
    // Get publisher's ObjectId
    const publisher = await Publisher.findOne({ email: session.email })
    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      )
    }

    // Check if article exists and belongs to this publisher
    const article = await Article.findOne({
      _id: id,
      publisher: publisher._id,
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or access denied' },
        { status: 404 }
      )
    }

    await Article.findByIdAndDelete(id)

    // Clear query cache after deleting article
    queryCache.clear('article:')
    queryCache.clear('author:')
    queryCache.clear('articles:all:')

    // Revalidate home page
    revalidatePath('/', 'page')
    if (article.category) {
      revalidatePath(`/${article.category}`, 'page')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
