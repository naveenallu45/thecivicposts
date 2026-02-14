import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    isValid: token ? !!verifyToken(token) : false,
    decoded: token ? verifyToken(token) : null,
    allCookies: Object.fromEntries(
      request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...'])
    ),
  })
}
