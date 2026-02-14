import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // If admin is logged in, restrict them to admin routes only
  if (token) {
    // Allow admin routes
    if (pathname.startsWith('/admin')) {
      // If trying to access admin login page while logged in, redirect to dashboard
      if (pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }
    
    // Admin is logged in but trying to access public route - redirect to admin dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // No token - protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // No token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Public routes - allow access for non-admin users
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
