'use client'

import { useState } from 'react'
import ConfirmDialog from '../admin/ConfirmDialog'

export default function AuthorLogoutButton() {
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/author/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Clear any client-side state if needed
        // Force full page reload to ensure cookie is cleared
        setTimeout(() => {
          window.location.href = '/author/login'
        }, 100)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      window.location.href = '/author/login'
    } finally {
      setLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  )
}
