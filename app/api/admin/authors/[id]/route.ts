import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import Article from '@/models/Article'
import { queryCache } from '@/lib/query-cache'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const author = await Author.findById(id).select('-password').lean()
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
    const { name, email, password, bio, avatar } = body

    // Get the old author name before updating
    const oldAuthor = await Author.findById(id)
    if (!oldAuthor) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    const oldAuthorName = oldAuthor.name

    // Prepare update data
    const updateData: {
      name?: string
      email?: string
      bio?: string
      avatar?: string
      password?: string
    } = { name, email, bio, avatar }
    
    // Only update password if provided (for existing authors)
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      updateData.password = hashPassword(password)
    }

    // Update the author
    const author = await Author.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // If the author name changed, update all articles with the old authorName
    // Also update articles that reference this author by ObjectId (to ensure consistency)
    if (name && name !== oldAuthorName) {
      // Update articles that have the old authorName
      const updateByNameResult = await Article.updateMany(
        { authorName: oldAuthorName },
        { $set: { authorName: name } }
      )

      // Also update articles that reference this author by ObjectId but have incorrect authorName
      // This ensures all articles for this author have the correct name
      const updateByIdResult = await Article.updateMany(
        { 
          author: id,
          authorName: { $ne: name } // Only update if authorName doesn't already match new name
        },
        { $set: { authorName: name } }
      )

      const totalUpdated = updateByNameResult.modifiedCount + updateByIdResult.modifiedCount
      if (totalUpdated > 0) {
        console.log(`Updated ${totalUpdated} articles with author name from "${oldAuthorName}" to "${name}"`)
      }

      // Clear all article-related caches since author names changed
      queryCache.clear('article:')
      queryCache.clear('author:')
      queryCache.clear('articles:all:')
    }

    // Don't send password back in response
    const authorResponse = {
      _id: author._id,
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatar: author.avatar,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    }

    return NextResponse.json({ 
      author: authorResponse,
      articlesUpdated: name && name !== oldAuthorName 
        ? await Article.countDocuments({ authorName: name })
        : 0
    })
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
