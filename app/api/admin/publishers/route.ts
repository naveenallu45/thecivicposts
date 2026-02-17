import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Publisher from '@/models/Publisher'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdminApi()
    await connectDB()

    const publishers = await Publisher.find().select('-password').sort({ name: 1 }).lean()
    return NextResponse.json({ publishers })
  } catch (error) {
    console.error('Error fetching publishers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publishers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi()
    await connectDB()

    const body = await request.json()
    const { name, email, password, avatar } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash password before saving
    const hashedPassword = hashPassword(password)

    // For admin-created publishers, we'll use a placeholder ObjectId
    // In a real system, you'd store the admin's MongoDB ObjectId
    const mongoose = await import('mongoose')
    const adminObjectId = new mongoose.default.Types.ObjectId()
    
    const publisher = new Publisher({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar,
      createdBy: adminObjectId,
      createdByRole: 'admin',
    })

    await publisher.save()

    // Don't send password back in response
    const publisherResponse = {
      _id: publisher._id,
      name: publisher.name,
      email: publisher.email,
      avatar: publisher.avatar,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt,
    }

    return NextResponse.json({ publisher: publisherResponse }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating publisher:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Publisher with this email already exists' },
        { status: 400 }
      )
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create publisher'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
