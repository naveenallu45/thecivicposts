'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import Image from 'next/image'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmDialog from './ConfirmDialog'

interface Author {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
}

interface AuthorsListProps {
  authors: Author[]
}

export default function AuthorsList({ authors }: AuthorsListProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; authorId: string | null; authorName: string }>({
    isOpen: false,
    authorId: null,
    authorName: '',
  })

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, authorId: id, authorName: name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.authorId) return

    setLoading(deleteDialog.authorId)
    try {
      const response = await fetch(`/api/admin/authors/${deleteDialog.authorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete author')
      }

      showToast('Author deleted successfully!', 'success')
      router.refresh()
      setDeleteDialog({ isOpen: false, authorId: null, authorName: '' })
    } catch (error) {
      console.error('Error deleting author:', error)
      showToast('Failed to delete author. Please try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, authorId: null, authorName: '' })
  }

  if (authors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No authors found.</p>
        <p className="text-sm mt-2">Add your first author using the form on the left.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {authors.map((author) => (
        <div
          key={author._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {author.avatar ? (
              <div className="flex-shrink-0">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl font-semibold">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{author.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{author.email}</p>
              {author.bio && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{author.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={() => router.push(`/admin/authors/${author._id}`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Author"
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                onClick={() => handleDeleteClick(author._id, author.name)}
                disabled={loading === author._id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Author"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteDialog.authorName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  )
}
