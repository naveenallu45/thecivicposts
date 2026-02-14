'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useEffect } from 'react'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ea580c', // Orange color matching the site
    },
    secondary: {
      main: '#6b7280', // Gray color
    },
  },
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add noindex meta tag to block admin pages from search engines
    const metaRobots = document.createElement('meta')
    metaRobots.name = 'robots'
    metaRobots.content = 'noindex, nofollow'
    document.head.appendChild(metaRobots)

    return () => {
      // Cleanup on unmount
      const existingMeta = document.querySelector('meta[name="robots"]')
      if (existingMeta && existingMeta.getAttribute('content') === 'noindex, nofollow') {
        existingMeta.remove()
      }
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ThemeProvider>
  )
}
