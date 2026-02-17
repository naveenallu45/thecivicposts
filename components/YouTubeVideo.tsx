'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getYouTubeEmbedUrl } from '@/lib/youtube-utils'

interface YouTubeVideoProps {
  videoId: string
  title: string
}

/**
 * YouTube video component that stops playing when user navigates away
 */
export default function YouTubeVideo({ videoId, title }: YouTubeVideoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Capture the current ref value
    const iframe = iframeRef.current
    
    // Cleanup function to stop video when component unmounts or pathname changes
    return () => {
      if (iframe) {
        // Change src to empty string to stop video playback
        iframe.src = ''
      }
    }
  }, [pathname]) // Re-run when pathname changes (navigation)

  return (
    <div className="mb-8 lg:w-3/4 lg:mx-auto">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={getYouTubeEmbedUrl(videoId)}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${title} - YouTube video`}
        />
      </div>
    </div>
  )
}
