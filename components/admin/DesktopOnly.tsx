'use client'

import { useEffect, useState } from 'react'

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState<boolean>(true) // Default to true to avoid loading delay

  useEffect(() => {
    // Check if screen width is laptop/desktop size (1024px+)
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    // Check immediately on mount (synchronous check)
    if (typeof window !== 'undefined') {
      checkScreenSize()
    }

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Block mobile/tablet access
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
            Desktop Access Required
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The admin panel is only accessible on desktop and laptop computers (screen width 1024px or larger).
            Please access the admin panel from a desktop or laptop device.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Current screen width:</strong> {typeof window !== 'undefined' ? window.innerWidth : 0}px
            </p>
            <p className="text-sm text-orange-800 mt-2">
              <strong>Required:</strong> 1024px or larger
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Allow access on desktop/laptop
  return <>{children}</>
}
