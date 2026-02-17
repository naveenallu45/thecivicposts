import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { redirect } from 'next/navigation'
import connectDB from './mongodb'
import Author from '@/models/Author'

export interface AuthorSession {
  email: string
  role: string
  authorId: string
  authorName: string
}

export async function getAuthorSession(): Promise<AuthorSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('author_token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'author') {
      return null
    }

    // Get author details from database
    await connectDB()
    const author = await Author.findOne({ email: decoded.email }).lean()
    
    if (!author) {
      return null
    }

    return {
      email: decoded.email,
      role: 'author',
      authorId: author._id.toString(),
      authorName: author.name,
    }
  } catch (error) {
    console.error('getAuthorSession error:', error)
    return null
  }
}

export async function requireAuthor() {
  const session = await getAuthorSession()

  if (!session) {
    redirect('/author/login')
  }

  return session
}

// For API routes - throws error instead of redirecting
export async function requireAuthorApi() {
  const session = await getAuthorSession()

  if (!session) {
    throw new Error('Unauthorized: Author authentication required')
  }

  return session
}
