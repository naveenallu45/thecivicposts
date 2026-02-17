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

export async function GET(request: NextRequest) {
  try {
    const session = await requirePublisherApi()
    await connectDB()

    // Get publisher's ObjectId
    const publisher = await Publisher.findOne({ email: session.email })
    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const query: { publisher: typeof publisher._id; status?: string; category?: string } = {
      publisher: publisher._id,
    }
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
    const session = await requirePublisherApi()
    await connectDB()

    // Get publisher's ObjectId
    const publisher = await Publisher.findOne({ email: session.email })
    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
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
      miniImage,
      youtubeLink,
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

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    if (slug.length > 200) {
      slug = slug.substring(0, 200).replace(/-+$/, '')
    }

    const article = new Article({
      title,
      subtitle,
      content,
      author,
      authorName: authorDoc.name, // Store author name
      publisher: publisher._id, // Set publisher field
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
