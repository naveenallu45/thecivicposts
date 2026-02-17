import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export const uploadImage = async (file: string, folder?: string) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder || 'thecivicposts',
      resource_type: 'image',
      // Use auto format for best compression (WebP/AVIF)
      fetch_format: 'auto',
      // High quality for HD images - Cloudinary will optimize automatically
      quality: 'auto:best',
      // Enable responsive transformations
      responsive: true,
      // Enable automatic format conversion
      transformation: [
        {
          fetch_format: 'auto', // Auto format (WebP/AVIF)
          quality: 'auto:best', // Best quality for HD
          dpr: 'auto', // Device pixel ratio for retina displays
        },
      ],
    })
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    throw error
  }
}

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw error
  }
}
