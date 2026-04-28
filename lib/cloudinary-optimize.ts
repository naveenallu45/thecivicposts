/**
 * Optimizes Cloudinary image URLs with transformations for CDN delivery
 * Adds format + sizing transforms while avoiding forced quality compression
 * Uses high quality settings for HD images
 * 
 * Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
 * 
 * @param url - Original Cloudinary URL
 * @param width - Optional width for responsive images (Next.js will handle srcset)
 * @param height - Optional height for aspect ratio
 * @param quality - Optional quality (default: 'auto:best' for HD, 'auto:good' for smaller images)
 * @returns Optimized Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  width?: number,
  height?: number,
  _quality: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number = 'auto:good',
  cropMode: 'fill' | 'fit' = 'fit'
): string {
  // Kept for API compatibility; quality transforms are intentionally disabled.
  void _quality

  if (!url || typeof url !== 'string') {
    return url
  }

  // Check if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url
  }

  // Parse Cloudinary URL structure
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const urlMatch = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.+)$/)
  
  if (!urlMatch) {
    return url
  }

  const [, basePath, rest] = urlMatch
  
  // Split transformations and public_id
  // Transformations are typically comma-separated or slash-separated
  const parts = rest.split('/')
  
  // Check if transformations already exist (they come before the public_id)
  // Transformations contain underscores like f_auto, q_auto, w_500, etc.
  const hasTransformations = parts[0].includes('_') || parts[0].includes(',')
  
  if (hasTransformations) {
    // Transformations exist - parse and enhance them
    const transformations = parts[0]
    const publicId = parts.slice(1).join('/')
    
    // Check what transformations we have
    const hasF = transformations.includes('f_')
    const hasC = transformations.includes('c_')
    const hasDpr = transformations.includes('dpr_')
    
    // Build transformation string
    const transformParts: string[] = []
    
    // Add format auto if missing (WebP/AVIF for modern browsers)
    if (!hasF) {
      transformParts.push('f_auto')
    }
    
    // Add device pixel ratio auto for retina displays (HD)
    if (!hasDpr) {
      transformParts.push('dpr_auto')
    }
    
    // Add width if provided and not already present
    if (width && !transformations.includes('w_')) {
      transformParts.push(`w_${width}`)
    }
    
    // Add height if provided and not already present
    if (height && !transformations.includes('h_')) {
      transformParts.push(`h_${height}`)
    }
    
    // Add crop mode if missing
    if (!hasC) {
      transformParts.push(`c_${cropMode}`)
    }
    
    // Remove quality transforms to avoid compression.
    const existingTransforms = transformations
      .split(',')
      .filter(t => t.trim() && !t.trim().startsWith('q_'))

    // Combine existing transformations with new ones
    // Use comma-separated format for Cloudinary
    const allTransforms = [...transformParts, ...existingTransforms]
    
    return `${basePath}${allTransforms.join(',')}/${publicId}`
  } else {
    // No transformations - add them
    const publicId = rest
    
    const transformParts: string[] = [
      'f_auto', // Auto format (WebP/AVIF)
      'dpr_auto', // Device pixel ratio for retina displays
    ]
    
    if (width) {
      transformParts.push(`w_${width}`)
    }
    if (height) {
      transformParts.push(`h_${height}`)
    }
    transformParts.push(`c_${cropMode}`)
    
    return `${basePath}${transformParts.join(',')}/${publicId}`
  }
}

/**
 * Gets optimized Cloudinary URL for Next.js Image component
 * Automatically applies responsive transformations with HD quality
 * 
 * @param url - Original Cloudinary URL
 * @param maxWidth - Maximum width for the image (used for srcset generation)
 * @param quality - Quality setting: 'auto:best' for HD, 'auto:good' for smaller images
 * @returns Optimized Cloudinary URL with CDN transformations
 */
export function getOptimizedImageUrl(
  url: string, 
  maxWidth?: number,
  _quality: 'auto:best' | 'auto:good' | 'auto:eco' | number = 'auto:good',
  height?: number,
  cropMode: 'fill' | 'fit' = 'fit'
): string {
  // Kept for API compatibility; quality transforms are intentionally disabled.
  void _quality

  return optimizeCloudinaryUrl(url, maxWidth, height, 'auto:good', cropMode)
}

/**
 * Gets a tightly framed Cloudinary URL for places where images must occupy
 * a consistent visual box even when the source upload has white padding.
 */
export function getFramedImageUrl(
  url: string,
  width: number,
  height: number,
  quality: 'auto:best' | 'auto:good' | 'auto:eco' | number = 'auto:best'
): string {
  const optimized = getOptimizedImageUrl(url, width, quality, height)

  if (!optimized.includes('res.cloudinary.com') || !optimized.includes('/image/upload/')) {
    return optimized
  }

  return optimized.replace(
    '/image/upload/',
    '/image/upload/e_trim,c_fit,g_auto/'
  )
}
