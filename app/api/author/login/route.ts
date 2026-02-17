import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import { comparePassword, generateAuthorToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find author by email
    const author = await Author.findOne({ email: email.toLowerCase().trim() })

    if (!author) {
      // Don't reveal whether email exists or not (security best practice)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = comparePassword(password, author.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = generateAuthorToken(author.email)

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      author: {
        id: author._id.toString(),
        name: author.name,
        email: author.email,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set('author_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Author login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
