import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'

export async function GET() {
  try {
    await requireAdminApi()
    await connectDB()

    const authors = await Author.find().sort({ name: 1 }).lean()
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

    const author = new Author({
      name,
      email,
      bio,
      avatar,
    })

    await author.save()
    return NextResponse.json({ author }, { status: 201 })
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
