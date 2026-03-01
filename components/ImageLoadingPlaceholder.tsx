'use client'

interface ImageLoadingPlaceholderProps {
  className?: string
}

export default function ImageLoadingPlaceholder({ className = '' }: ImageLoadingPlaceholderProps) {
  return (
    <div className={`bg-gray-200 animate-pulse ${className}`}>
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  )
}
