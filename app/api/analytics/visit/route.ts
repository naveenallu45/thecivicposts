import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import '@/models'
import connectDB from '@/lib/mongodb'
import VisitorEvent from '@/models/VisitorEvent'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json().catch(() => ({}))
    const page = typeof body?.page === 'string' ? body.page : ''

    if (page === 'home') {
      const cookieVisitorId = request.cookies.get('tcp_visitor_id')?.value
      const visitorId = cookieVisitorId || randomUUID()

      await VisitorEvent.findOneAndUpdate(
        { visitorId, slug: '__home__' },
        { $setOnInsert: { visitorId, slug: '__home__' } },
        { upsert: true, returnDocument: 'after' }
      )

      const response = NextResponse.json({ success: true })
      if (!cookieVisitorId) {
        response.cookies.set('tcp_visitor_id', visitorId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
        })
      }
      return response
    }

    return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Analytics visit tracking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track visit' },
      { status: 500 }
    )
  }
}
