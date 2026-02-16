/**
 * Optimizes Cloudinary image URLs with transformations
 * Adds f_auto (format auto), q_auto (quality auto), w_auto (width auto), c_fill (crop fill)
 * 
 * Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
 * 
 * @param url - Original Cloudinary URL
 * @param width - Optional width for responsive images (Next.js will handle srcset)
 * @param height - Optional height for aspect ratio
 * @returns Optimized Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  width?: number,
  height?: number
): string {
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
        const hasQ = transformations.includes('q_')
        const hasC = transformations.includes('c_')
        
        // Build transformation string
        const transformParts: string[] = []
        
        // Add format auto if missing
        if (!hasF) {
          transformParts.push('f_auto')
        }
        
        // Add quality auto if missing
        if (!hasQ) {
          transformParts.push('q_auto')
        }
        
        // Add width if provided and not already present
        if (width && !transformations.includes('w_')) {
          transformParts.push(`w_${width}`)
        }
        
        // Add height if provided and not already present
        if (height && !transformations.includes('h_')) {
          transformParts.push(`h_${height}`)
        }
        
        // Add crop fill if missing
        if (!hasC) {
          transformParts.push('c_fill')
        }
        
        // Combine existing transformations with new ones
        // Use comma-separated format for Cloudinary
        const existingTransforms = transformations.split(',').filter(t => t.trim())
        const allTransforms = [...transformParts, ...existingTransforms]
        
        return `${basePath}${allTransforms.join(',')}/${publicId}`
      } else {
        // No transformations - add them
        const publicId = rest
        
        const transformParts: string[] = ['f_auto', 'q_auto']
        
        if (width) {
          transformParts.push(`w_${width}`)
        }
        if (height) {
          transformParts.push(`h_${height}`)
        }
        transformParts.push('c_fill')
        
        return `${basePath}${transformParts.join(',')}/${publicId}`
      }
}

/**
 * Gets optimized Cloudinary URL for Next.js Image component
 * Automatically applies responsive transformations
 * 
 * @param url - Original Cloudinary URL
 * @param maxWidth - Maximum width for the image (used for srcset generation)
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedImageUrl(url: string, maxWidth?: number): string {
  return optimizeCloudinaryUrl(url, maxWidth)
}
