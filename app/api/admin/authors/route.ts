import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'

export async function GET() {
  try {
    await requireAdminApi()
    await connectDB()

    const authors = await Author.find().select('-password').sort({ name: 1 }).lean()
    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi()
    await connectDB()

    const body = await request.json()
    const { name, email, bio, avatar } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const author = new Author({
      name,
      email: email.toLowerCase().trim(),
      bio,
      avatar,
    })

    await author.save()

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

    return NextResponse.json({ author: authorResponse }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating author:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Author with this email already exists' },
        { status: 400 }
      )
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create author'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
