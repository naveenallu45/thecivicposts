import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireArticleAuth } from '@/lib/article-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'
import { queryCache } from '@/lib/query-cache'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireArticleAuth()
    await connectDB()

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
    } = body

    // If author is creating, use their ID (admin can specify any author)
    const finalAuthorId = auth.isAuthor ? auth.authorId : authorId

    if (!finalAuthorId) {
      return NextResponse.json(
        { error: 'Author is required' },
        { status: 400 }
      )
    }

    // Get author name before creating article
    const authorDoc = await Author.findById(finalAuthorId)
    if (!authorDoc) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 400 }
      )
    }

    // Generate slug from title - includes full title
    let slug = title
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

    const article = new Article({
      title,
      subtitle,
      content,
      author: finalAuthorId,
      authorName: authorDoc.name, // Store author name
      publishedDate: new Date(publishedDate),
      mainImage,
      miniImage: miniImage || undefined,
      youtubeLink: youtubeLink?.trim() || undefined,
      subImages: subImages || [],
      status: status || 'draft',
      category,
      slug,
    })

    await article.save()

    // Clear query cache after creating article
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

    return NextResponse.json({ article }, { status: 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create article'
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
