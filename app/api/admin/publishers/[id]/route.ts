import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import connectDB from '@/lib/mongodb'
import Publisher from '@/models/Publisher'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi()
    await connectDB()

    const { id } = await params
    const publisher = await Publisher.findById(id).select('-password').lean()
    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    return NextResponse.json({ publisher })
  } catch (error) {
    console.error('Error fetching publisher:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publisher' },
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
    const { name, email, password, avatar } = body

    // Prepare update data
    const updateData: {
      name?: string
      email?: string
      avatar?: string
      password?: string
    } = { name, email, avatar }
    
    // Only update password if provided
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      updateData.password = hashPassword(password)
    }

    // Update the publisher
    const publisher = await Publisher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Don't send password back in response
    const publisherResponse = {
      _id: publisher._id,
      name: publisher.name,
      email: publisher.email,
      avatar: publisher.avatar,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt,
    }

    return NextResponse.json({ publisher: publisherResponse })
  } catch (error: unknown) {
    console.error('Error updating publisher:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update publisher'
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
    
    // Check if publisher exists
    const publisher = await Publisher.findById(id)
    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }
    
    // Delete the publisher
    await Publisher.findByIdAndDelete(id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Publisher deleted successfully.'
    })
  } catch (error) {
    console.error('Error deleting publisher:', error)
    return NextResponse.json(
      { error: 'Failed to delete publisher' },
      { status: 500 }
    )
  }
}
