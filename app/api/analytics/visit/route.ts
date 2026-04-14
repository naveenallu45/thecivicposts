import { NextRequest, NextResponse } from 'next/server'
import '@/models'
import connectDB from '@/lib/mongodb'
import VisitorEvent from '@/models/VisitorEvent'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json().catch(() => ({}))
    const page = typeof body?.page === 'string' ? body.page : ''

    if (page === 'home') {
      await VisitorEvent.create({ slug: '__home__' })
      return NextResponse.json({ success: true })
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
