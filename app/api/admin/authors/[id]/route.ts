import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const author = await Author.findById(id).lean()
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json({ author })
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const body = await request.json()
    const { name, email, bio, avatar } = body

    const author = await Author.findByIdAndUpdate(
      id,
      { name, email, bio, avatar },
      { new: true, runValidators: true }
    )

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json({ author })
  } catch (error: unknown) {
    console.error('Error updating author:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update author'
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
    // Import Article to check for existing articles
    const Article = (await import('@/models/Article')).default
    
    // Check if author exists
    const author = await Author.findById(id)
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // Check if author has any articles
    const articleCount = await Article.countDocuments({ author: id })
    
    // Delete the author - articles will keep authorName field which preserves the name
    // This ensures articles remain intact even if author is deleted
    await Author.findByIdAndDelete(id)
    
    return NextResponse.json({ 
      success: true,
      message: articleCount > 0 
        ? `Author deleted successfully. ${articleCount} existing article(s) will continue to display the author name (${author.name}) as stored in the article.`
        : 'Author deleted successfully.'
    })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    )
  }
}
