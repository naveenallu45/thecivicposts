'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthorNotFound() {
  const router = useRouter()

  useEffect(() => {
    // Instant redirect to home page
    router.replace('/')
  }, [router])

  // Show nothing while redirecting
  return null
}
