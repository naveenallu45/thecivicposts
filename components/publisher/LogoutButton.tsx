'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function PublisherLogoutButton() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/publisher/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        router.push('/publisher/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowDialog(false)}
        type="warning"
      />
    </>
  )
}
