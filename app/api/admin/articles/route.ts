import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
// Import models index FIRST to ensure all models are registered before use
import '@/models'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Author from '@/models/Author'

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi()
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const query: { status?: string; category?: string } = {}
    if (status) query.status = status
    if (category) query.category = category

    const articles = await Article.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Article.countDocuments(query)

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      subtitle,
      content,
      author,
      publishedDate,
      mainImage,
      miniImage,
      subImages,
      status,
      category,
    } = body

    // Get author name before creating article
    const authorDoc = await Author.findById(author)
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
      author,
      authorName: authorDoc.name, // Store author name
      publishedDate: new Date(publishedDate),
      mainImage,
      miniImage: miniImage || undefined,
      subImages: subImages || [],
      status: status || 'draft',
      category,
      slug,
    })

    await article.save()
    // Note: authorName is already stored, no need to populate

    // Revalidate home page if article is published or has home page flags
    if (status === 'published' || article.isTopStory || article.isMiniTopStory || article.isLatest || article.isTrending) {
      revalidatePath('/', 'page')
      // Also revalidate category page if category is set
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
