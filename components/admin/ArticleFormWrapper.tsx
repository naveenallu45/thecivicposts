'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArticleForm from './ArticleForm'
import LogoutButton from './LogoutButton'

interface Author {
  _id: string
  name: string
  email: string
}

interface Article {
  _id: string
  title: string
  subtitle?: string
  content: string[]
  author: string
  publishedDate: string
  mainImage: { url: string; public_id: string; alt?: string }
  subImages: Array<{ url: string; public_id: string; alt?: string; order: number }>
  status: 'draft' | 'published'
  category: string
}

interface ArticleFormWrapperProps {
  authors: Author[]
  article?: Article
  isEdit?: boolean
}

export default function ArticleFormWrapper({ authors, article, isEdit = false }: ArticleFormWrapperProps) {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">
              {isPreview ? 'Preview Article' : isEdit ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex gap-4">
              <Link
                href="/admin/dashboard"
                prefetch={true}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ArticleForm
          authors={authors}
          article={article}
          onPreviewChange={setIsPreview}
        />
      </div>
    </>
  )
}
