import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { redirect } from 'next/navigation'
import connectDB from './mongodb'
import Publisher from '@/models/Publisher'

export interface PublisherSession {
  email: string
  role: string
  publisherId: string
  publisherName: string
}

export async function getPublisherSession(): Promise<PublisherSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('publisher_token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'publisher') {
      return null
    }

    await connectDB()
    const publisher = await Publisher.findOne({ email: decoded.email })
      .select('name email')
      .lean()

    if (!publisher) {
      return null
    }

    return {
      email: publisher.email,
      role: 'publisher',
      publisherId: publisher._id.toString(),
      publisherName: publisher.name,
    }
  } catch {
    return null
  }
}

export async function requirePublisher() {
  const session = await getPublisherSession()
  if (!session) {
    redirect('/publisher/login')
  }
  return session
}

export async function requirePublisherApi() {
  const session = await getPublisherSession()
  if (!session) {
    throw new Error('Unauthorized: Publisher authentication required')
  }
  return session
}
