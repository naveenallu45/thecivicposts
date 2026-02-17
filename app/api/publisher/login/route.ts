import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Publisher from '@/models/Publisher'
import { generatePublisherToken, comparePassword } from '@/lib/auth'

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

    const publisher = await Publisher.findOne({ email: email.toLowerCase().trim() })

    if (!publisher) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isPasswordValid = comparePassword(password, publisher.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = generatePublisherToken(publisher.email)

    const response = NextResponse.json({
      success: true,
      publisher: {
        id: publisher._id.toString(),
        name: publisher.name,
        email: publisher.email,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set('publisher_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Publisher login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
