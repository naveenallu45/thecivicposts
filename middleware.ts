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

  // Check if admin/publisher is logged in (with error handling)
  let isAdminLoggedIn = false
  let isPublisherLoggedIn = false
  
  const adminToken = request.cookies.get('admin_token')?.value
  const publisherToken = request.cookies.get('publisher_token')?.value
  
  if (adminToken) {
    try {
      const decoded = verifyToken(adminToken)
      isAdminLoggedIn = !!decoded && decoded.role === 'admin'
    } catch (error) {
      isAdminLoggedIn = false
    }
  }
  
  if (publisherToken) {
    try {
      const decoded = verifyToken(publisherToken)
      isPublisherLoggedIn = !!decoded && decoded.role === 'publisher'
    } catch (error) {
      isPublisherLoggedIn = false
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

  // STRICT ROUTE RESTRICTION: Admins and Publishers can ONLY access their respective routes
  
  // If admin is logged in, restrict to ONLY admin routes
  if (isAdminLoggedIn) {
    // Allow admin routes
    if (pathname.startsWith('/admin')) {
      // If trying to access admin login page while logged in, redirect to dashboard
      if (pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return response
    }
    // Block ALL other routes (publisher routes, public routes, etc.)
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // If publisher is logged in, restrict to ONLY publisher routes
  if (isPublisherLoggedIn) {
    // Allow publisher routes
    if (pathname.startsWith('/publisher')) {
      // If trying to access publisher login page while logged in, redirect to dashboard
      if (pathname === '/publisher/login') {
        return NextResponse.redirect(new URL('/publisher/dashboard', request.url))
      }
      return response
    }
    // Block ALL other routes (admin routes, public routes, etc.)
    return NextResponse.redirect(new URL('/publisher/dashboard', request.url))
  }

  // Handle admin routes (when not logged in)
  if (pathname.startsWith('/admin')) {
    // Allow admin login page
    if (pathname === '/admin/login') {
      return response
    }
    // No admin token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Handle publisher routes (when not logged in)
  if (pathname.startsWith('/publisher')) {
    // Allow publisher login page
    if (pathname === '/publisher/login') {
      return response
    }
    // No publisher token, redirect to login
    return NextResponse.redirect(new URL('/publisher/login', request.url))
  }

  // Handle author routes - only public profile pages (no login needed)
  // Author profile pages like /author/[slug] are public and don't require authentication

  // Public routes - allow access for non-admin/non-publisher users
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
