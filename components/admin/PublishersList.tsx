'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import Image from 'next/image'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmDialog from './ConfirmDialog'

interface Publisher {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface PublishersListProps {
  publishers: Publisher[]
}

export default function PublishersList({ publishers }: PublishersListProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; publisherId: string | null; publisherName: string }>({
    isOpen: false,
    publisherId: null,
    publisherName: '',
  })

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, publisherId: id, publisherName: name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.publisherId) return

    setLoading(deleteDialog.publisherId)
    try {
      const response = await fetch(`/api/admin/publishers/${deleteDialog.publisherId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete publisher')
      }

      showToast('Publisher deleted successfully!', 'success')
      router.refresh()
      setDeleteDialog({ isOpen: false, publisherId: null, publisherName: '' })
    } catch (error) {
      console.error('Error deleting publisher:', error)
      showToast('Failed to delete publisher. Please try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, publisherId: null, publisherName: '' })
  }

  if (publishers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No publishers found.</p>
        <p className="text-sm mt-2">Add your first publisher using the form on the left.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {publishers.map((publisher) => (
        <div
          key={publisher._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {publisher.avatar ? (
              <div className="flex-shrink-0">
                <Image
                  src={publisher.avatar}
                  alt={publisher.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl font-semibold">
                  {publisher.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Publisher Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{publisher.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{publisher.email}</p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={() => {
                  router.prefetch(`/admin/publishers/${publisher._id}`)
                  router.push(`/admin/publishers/${publisher._id}`)
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Publisher"
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                onClick={() => handleDeleteClick(publisher._id, publisher.name)}
                disabled={loading === publisher._id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Publisher"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Publisher"
        message={`Are you sure you want to delete "${deleteDialog.publisherName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  )
}
