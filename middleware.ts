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
  let isAuthorLoggedIn = false
  
  const adminToken = request.cookies.get('admin_token')?.value
  const authorToken = request.cookies.get('author_token')?.value
  
  if (adminToken) {
    try {
      const decoded = verifyToken(adminToken)
      isAdminLoggedIn = !!decoded && decoded.role === 'admin'
    } catch (error) {
      isAdminLoggedIn = false
    }
  }
  
  if (authorToken) {
    try {
      const decoded = verifyToken(authorToken)
      isAuthorLoggedIn = !!decoded && decoded.role === 'author'
    } catch (error) {
      isAuthorLoggedIn = false
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

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    if (isAdminLoggedIn) {
      // If trying to access admin login page while logged in, redirect to dashboard
      if (pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return response
    }
    
    // No admin token - protect admin routes
    if (pathname === '/admin/login') {
      return response
    }
    
    // No admin token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Handle author routes
  if (pathname.startsWith('/author')) {
    if (isAuthorLoggedIn) {
      // If trying to access author login page while logged in, redirect to dashboard
      if (pathname === '/author/login') {
        return NextResponse.redirect(new URL('/author/dashboard', request.url))
      }
      return response
    }
    
    // No author token - protect author routes
    if (pathname === '/author/login') {
      return response
    }
    
    // No author token, redirect to login
    return NextResponse.redirect(new URL('/author/login', request.url))
  }

  // If admin is logged in, restrict them to admin routes only (not author routes)
  if (isAdminLoggedIn && pathname.startsWith('/author')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // If author is logged in, restrict them to author routes only (not admin routes)
  if (isAuthorLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/author/dashboard', request.url))
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
