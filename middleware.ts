import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const pathname = request.nextUrl.pathname

  // Block admin access on mobile/tablet devices (check User-Agent)
  if (pathname.startsWith('/admin')) {
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileOrTablet = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    // Also check for viewport width header if available (some browsers send this)
    const viewportWidth = request.headers.get('viewport-width')
    const isSmallScreen = viewportWidth ? parseInt(viewportWidth) < 1024 : false
    
    if (isMobileOrTablet || isSmallScreen) {
      // Allow login page to show the desktop-only message
      if (pathname === '/admin/login') {
        return NextResponse.next()
      }
      // Block all other admin routes on mobile/tablet
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Block admin access on mobile/tablet devices (check User-Agent)
  if (pathname.startsWith('/admin')) {
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileOrTablet = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    // Block mobile/tablet access to admin routes (except login page which shows desktop-only message)
    if (isMobileOrTablet && pathname !== '/admin/login') {
      // Redirect to login page which will show desktop-only message
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
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
