'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from './ConfirmDialog'

export default function LogoutButton() {
  const [showDialog, setShowDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Redirect to login page
        router.push('/admin/login')
        router.refresh()
      } else {
        // Even if logout fails, redirect to login
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Redirect to login page even on error
      router.push('/admin/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        disabled={isLoggingOut}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the admin panel."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowDialog(false)}
      />
    </>
  )
}
