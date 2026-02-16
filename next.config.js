/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // CDN optimization - Cloudinary already acts as CDN
    domains: ['res.cloudinary.com'],
    // Responsive image sizes for different device breakpoints
    // Optimized for mobile-first approach
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Thumbnail sizes for smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (Cloudinary handles versioning)
    minimumCacheTTL: 31536000,
    // Disable SVG for security
    dangerouslyAllowSVG: false,
    // Enable content-based image optimization
    contentDispositionType: 'attachment',
    // Optimize images on-demand
    unoptimized: false,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Set output file tracing root to silence lockfile warning
  outputFileTracingRoot: require('path').join(__dirname),
  // Enable static exports if needed
  // output: 'standalone',
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  // Production-level caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

// Bundle analyzer (only in analyze mode)
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
}
