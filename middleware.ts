import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()
  const token = request.cookies.get('admin_token')?.value

  // Production-level cache headers for static assets
  if (pathname.startsWith('/_next/static')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Cache headers for images
  if (
    pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Cache headers for fonts
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Cache headers for API routes (handled in route handlers, but add fallback)
  if (pathname.startsWith('/api/')) {
    // Don't override route-specific cache headers
    if (!response.headers.get('Cache-Control')) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=300'
      )
    }
  }

  // Skip middleware logic for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return response
  }

  // Check if admin is logged in (with error handling)
  let isAdminLoggedIn = false
  if (token) {
    try {
      const decoded = verifyToken(token)
      isAdminLoggedIn = !!decoded
      if (pathname.startsWith('/admin')) {
        console.log('Middleware - Token found:', !!token, 'Decoded:', !!decoded, 'Path:', pathname)
      }
    } catch (error) {
      // If token verification fails, treat as not logged in
      isAdminLoggedIn = false
      if (pathname.startsWith('/admin')) {
        console.log('Middleware - Token verification failed:', error)
      }
    }
  } else {
    if (pathname.startsWith('/admin')) {
      console.log('Middleware - No token found for path:', pathname)
    }
  }

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
        return response
      }
      // Block all other admin routes on mobile/tablet
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // If admin is logged in, restrict them to admin routes only
  if (isAdminLoggedIn) {
    // Allow admin routes
    if (pathname.startsWith('/admin')) {
      // If trying to access admin login page while logged in, redirect to dashboard
      if (pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return response
    }
    
    // Admin is logged in but trying to access public/user route - redirect to admin dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // No token - protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow login page
    if (pathname === '/admin/login') {
      return response
    }

    // No token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Public routes - allow access for non-admin users
  return response
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
  runtime: 'nodejs', // Use Node.js runtime instead of Edge runtime to support jsonwebtoken
}
