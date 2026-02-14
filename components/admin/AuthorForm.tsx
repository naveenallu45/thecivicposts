'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthorFormProps {
  author?: {
    _id: string
    name: string
    email: string
    bio?: string
    avatar?: string
  }
}

export default function AuthorForm({ author }: AuthorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: author?.name || '',
    email: author?.email || '',
    bio: author?.bio || '',
    avatar: author?.avatar || '',
  })
  const [uploading, setUploading] = useState(false)

  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return ''
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFormData((prev) => ({ ...prev, avatar: data.url }))
    } catch {
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = author
        ? `/api/admin/authors/${author._id}`
        : '/api/admin/authors'
      const method = author ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save author')
      }

      router.refresh()
      if (!author) {
        setFormData({ name: '', email: '', bio: '', avatar: '' })
        // Show success message
        alert('Author added successfully!')
      } else {
        alert('Author updated successfully!')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save author')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            const capitalized = capitalizeFirstLetter(e.target.value)
            setFormData({ ...formData, name: capitalized })
          }}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avatar
        </label>
        {formData.avatar ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.avatar}
              alt="Avatar"
              className="w-32 h-32 object-contain rounded-lg mb-2 bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, avatar: '' })}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
            }}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : author ? 'Update Author' : 'Add Author'}
      </button>
    </form>
  )
}
