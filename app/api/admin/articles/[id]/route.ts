import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import { deleteImage } from '@/lib/cloudinary'
import { queryCache } from '@/lib/query-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const article = await Article.findById(id)
      .populate('author', 'name email bio')
      .lean()

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
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
    try {
      await requireAdminApi()
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: authError instanceof Error ? authError.message : 'Unauthorized' },
        { status: 401 }
      )
    }
    await connectDB()

    const { id } = await params
    const body = await request.json()
    const {
      title,
      subtitle,
      content,
      author,
      publishedDate,
      mainImage,
      miniImage,
      youtubeLink,
      subImages,
      status,
      category,
      deletedImages,
      isTopStory,
      isMiniTopStory,
      isLatest,
      isTrending,
    } = body

    const article = await Article.findById(id)
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Store old values BEFORE updating to check if home page flags changed
    const oldStatus = article.status
    const oldIsTopStory = article.isTopStory
    const oldIsMiniTopStory = article.isMiniTopStory
    const oldIsLatest = article.isLatest
    const oldIsTrending = article.isTrending
    const oldCategory = article.category
    const oldTitle = article.title
    const oldSubtitle = article.subtitle
    const oldMainImage = article.mainImage?.url
    const oldPublishedDate = article.publishedDate
    const oldAuthorName = article.authorName

    // Always ensure authorName is stored (required field)
    // If author is being updated, get and store the author name
    if (author !== undefined) {
      const authorDoc = await Author.findById(author)
      if (authorDoc) {
        article.authorName = authorDoc.name
      } else if (!article.authorName) {
        // If author not found but article exists, keep existing authorName
        // This handles case where author was deleted but article remains
        return NextResponse.json(
          { error: 'Author not found' },
          { status: 400 }
        )
      }
    } else if (!article.authorName) {
      // Ensure authorName exists even if author field wasn't updated
      const authorDoc = await Author.findById(article.author)
      if (authorDoc) {
        article.authorName = authorDoc.name
      }
      // If author doesn't exist (was deleted), keep existing authorName
    }

    // Delete old images if new ones are uploaded
    if (deletedImages && deletedImages.length > 0) {
      for (const publicId of deletedImages) {
        try {
          await deleteImage(publicId)
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }
    }

            // Generate slug if title changed - includes full title
            let slug = article.slug
            if (title && title !== article.title) {
              slug = title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
              
              // Limit length but keep full title words (max 200 chars)
              if (slug.length > 200) {
                slug = slug.substring(0, 200).replace(/-+$/, '') // Remove trailing hyphen if cut mid-word
              }
            }

    // Update fields only if they are provided in the request
    if (title !== undefined) article.title = title
    if (subtitle !== undefined) article.subtitle = subtitle
    if (content !== undefined) article.content = content
    if (author !== undefined) article.author = author
    if (publishedDate !== undefined) article.publishedDate = new Date(publishedDate)
    if (mainImage !== undefined) article.mainImage = mainImage
    if (miniImage !== undefined) article.miniImage = miniImage || undefined
    if (youtubeLink !== undefined) article.youtubeLink = youtubeLink?.trim() || undefined
    if (subImages !== undefined) article.subImages = subImages || []
    if (status !== undefined) article.status = status
    if (category !== undefined) article.category = category
    if (slug) article.slug = slug
    
    // Handle boolean fields - check if they are explicitly provided (including false)
    if (isTopStory !== undefined) article.isTopStory = Boolean(isTopStory)
    if (isMiniTopStory !== undefined) article.isMiniTopStory = Boolean(isMiniTopStory)
    if (isLatest !== undefined) article.isLatest = Boolean(isLatest)
    if (isTrending !== undefined) article.isTrending = Boolean(isTrending)

    await article.save()
    // Note: authorName is already stored, no need to populate

    // Clear query cache for this article and related queries
    queryCache.delete(`article:single:${article.slug}`)
    queryCache.clear('article:') // Clear all article list caches
    queryCache.clear('author:') // Clear author caches
    queryCache.clear('articles:all:') // Clear "all articles" cache

    // Revalidate home page if:
    // 1. Status changed to/from published
    // 2. Any home page flags changed (isTopStory, isMiniTopStory, isLatest, isTrending)
    // 3. Category changed
    // 4. Fields displayed on home page changed (title, subtitle, mainImage, publishedDate, authorName)
    //    AND article is published with home page flags
    const statusChanged = status !== undefined && status !== oldStatus
    const flagsChanged = 
      (isTopStory !== undefined && isTopStory !== oldIsTopStory) ||
      (isMiniTopStory !== undefined && isMiniTopStory !== oldIsMiniTopStory) ||
      (isLatest !== undefined && isLatest !== oldIsLatest) ||
      (isTrending !== undefined && isTrending !== oldIsTrending)
    const categoryChanged = category !== undefined && category !== oldCategory
    
    // Check if fields displayed on home page changed
    const mainImageChanged = mainImage !== undefined && 
      mainImage?.url !== oldMainImage
    const homePageFieldsChanged = 
      (title !== undefined && title !== oldTitle) ||
      (subtitle !== undefined && subtitle !== oldSubtitle) ||
      mainImageChanged ||
      (publishedDate !== undefined && new Date(publishedDate).getTime() !== oldPublishedDate?.getTime()) ||
      (author !== undefined && article.authorName !== oldAuthorName)
    
    const affectsHomePage = article.status === 'published' && 
      (article.isTopStory || article.isMiniTopStory || article.isLatest || article.isTrending)

    // Revalidate if any relevant changes occurred
    if (statusChanged || flagsChanged || categoryChanged || 
        (affectsHomePage && homePageFieldsChanged)) {
      revalidatePath('/', 'page')
      // Revalidate old category page if category changed
      if (categoryChanged && oldCategory) {
        revalidatePath(`/${oldCategory}`, 'page')
      }
      // Revalidate new category page
      if (article.category) {
        revalidatePath(`/${article.category}`, 'page')
      }
      // Revalidate article detail page
      revalidatePath(`/${article.category}/${article.slug}`, 'page')
    }

    return NextResponse.json({ article })
  } catch (error: unknown) {
    console.error('Error updating article:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update article'
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
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const article = await Article.findById(id)
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Delete images from Cloudinary
    try {
      await deleteImage(article.mainImage.public_id)
      for (const subImage of article.subImages) {
        await deleteImage(subImage.public_id)
      }
    } catch (error) {
      console.error('Error deleting images:', error)
    }

    const deletedArticle = await Article.findByIdAndDelete(id)

    // Clear query cache after deletion
    if (deletedArticle) {
      queryCache.delete(`article:single:${deletedArticle.slug}`)
      queryCache.clear('article:') // Clear all article list caches
      queryCache.clear('author:') // Clear author caches
      queryCache.clear('articles:all:') // Clear "all articles" cache

      // Revalidate home page and category page after deletion
      revalidatePath('/', 'page')
      if (deletedArticle.category) {
        revalidatePath(`/${deletedArticle.category}`, 'page')
        revalidatePath(`/${deletedArticle.category}/${deletedArticle.slug}`, 'page')
      }
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
