import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireArticleAuth } from '@/lib/article-auth'
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
    const auth = await requireArticleAuth()
    await connectDB()

    const { id } = await params
    const article = await Article.findById(id)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // If author, check if they own this article
    if (auth.isAuthor && article.author.toString() !== auth.authorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only view your own articles' },
        { status: 403 }
      )
    }

    return NextResponse.json({ article })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch article'
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireArticleAuth()
    await connectDB()

    const { id } = await params
    const body = await request.json()
    const {
      title,
      subtitle,
      content,
      author: authorId,
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

    // If author, check if they own this article
    if (auth.isAuthor && article.author.toString() !== auth.authorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only edit your own articles' },
        { status: 403 }
      )
    }

    // Authors cannot change the author field or home page flags
    if (auth.isAuthor) {
      if (authorId && authorId !== article.author.toString()) {
        return NextResponse.json(
          { error: 'Unauthorized: Authors cannot change article author' },
          { status: 403 }
        )
      }
      // Authors cannot set home page flags
      if (isTopStory !== undefined || isMiniTopStory !== undefined || isLatest !== undefined || isTrending !== undefined) {
        return NextResponse.json(
          { error: 'Unauthorized: Authors cannot set home page flags' },
          { status: 403 }
        )
      }
    }

    // Store old values BEFORE updating
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

    // Update author name if author changed (admin only)
    if (!auth.isAuthor && authorId !== undefined && authorId !== article.author.toString()) {
      const authorDoc = await Author.findById(authorId)
      if (authorDoc) {
        article.authorName = authorDoc.name
        article.author = authorId
      } else {
        return NextResponse.json(
          { error: 'Author not found' },
          { status: 400 }
        )
      }
    } else if (!article.authorName) {
      // Ensure authorName exists
      const authorDoc = await Author.findById(article.author)
      if (authorDoc) {
        article.authorName = authorDoc.name
      }
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

    // Generate slug if title changed
    let slug = article.slug
    if (title && title !== article.title) {
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

    // Update article fields
    article.title = title ?? article.title
    article.subtitle = subtitle ?? article.subtitle
    article.content = content ?? article.content
    article.publishedDate = publishedDate ? new Date(publishedDate) : article.publishedDate
    article.mainImage = mainImage ?? article.mainImage
    article.miniImage = miniImage !== undefined ? (miniImage || undefined) : article.miniImage
    article.youtubeLink = youtubeLink !== undefined ? (youtubeLink?.trim() || undefined) : article.youtubeLink
    article.subImages = subImages ?? article.subImages
    article.status = status ?? article.status
    article.category = category ?? article.category
    article.slug = slug

    // Only allow admin to set home page flags
    if (auth.isAdmin) {
      article.isTopStory = isTopStory ?? article.isTopStory
      article.isMiniTopStory = isMiniTopStory ?? article.isMiniTopStory
      article.isLatest = isLatest ?? article.isLatest
      article.isTrending = isTrending ?? article.isTrending
    }

    await article.save()

    // Clear query cache
    queryCache.delete(`article:${id}`)
    queryCache.clear('article:')
    queryCache.clear('author:')
    queryCache.clear('articles:all:')

    // Revalidate paths if needed
    const needsRevalidation = 
      oldStatus !== article.status ||
      oldIsTopStory !== article.isTopStory ||
      oldIsMiniTopStory !== article.isMiniTopStory ||
      oldIsLatest !== article.isLatest ||
      oldIsTrending !== article.isTrending ||
      oldCategory !== article.category ||
      oldTitle !== article.title ||
      oldSubtitle !== article.subtitle ||
      oldMainImage !== article.mainImage?.url ||
      oldPublishedDate?.getTime() !== article.publishedDate?.getTime() ||
      oldAuthorName !== article.authorName

    if (needsRevalidation) {
      revalidatePath('/', 'page')
      if (article.category) {
        revalidatePath(`/${article.category}`, 'page')
      }
      if (oldCategory && oldCategory !== article.category) {
        revalidatePath(`/${oldCategory}`, 'page')
      }
      if (article.slug) {
        revalidatePath(`/${article.category}/${article.slug}`, 'page')
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
    const auth = await requireArticleAuth()
    await connectDB()

    const { id } = await params
    const article = await Article.findById(id)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // If author, check if they own this article
    if (auth.isAuthor && article.author.toString() !== auth.authorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own articles' },
        { status: 403 }
      )
    }

    // Delete images from Cloudinary
    if (article.mainImage?.public_id) {
      try {
        await deleteImage(article.mainImage.public_id)
      } catch (error) {
        console.error('Error deleting main image:', error)
      }
    }

    if (article.miniImage?.public_id) {
      try {
        await deleteImage(article.miniImage.public_id)
      } catch (error) {
        console.error('Error deleting mini image:', error)
      }
    }

    if (article.subImages && article.subImages.length > 0) {
      for (const subImage of article.subImages) {
        if (subImage.public_id) {
          try {
            await deleteImage(subImage.public_id)
          } catch (error) {
            console.error('Error deleting sub image:', error)
          }
        }
      }
    }

    const category = article.category
    const slug = article.slug

    await Article.findByIdAndDelete(id)

    // Clear query cache
    queryCache.delete(`article:${id}`)
    queryCache.clear('article:')
    queryCache.clear('author:')
    queryCache.clear('articles:all:')

    // Revalidate paths
    revalidatePath('/', 'page')
    if (category) {
      revalidatePath(`/${category}`, 'page')
    }
    if (slug) {
      revalidatePath(`/${category}/${slug}`, 'page')
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete article'
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
