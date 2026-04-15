'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'

export default function PublisherLiveUpdatesPage() {
    const [youtubeLinks, setYoutubeLinks] = useState<string[]>(['', '', '', ''])
    const [currentVideoIds, setCurrentVideoIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { showToast } = useToast()

    const fetchLiveSettings = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/settings/live')
            const data = await response.json()
            const links = Array.isArray(data.youtubeLinks) ? data.youtubeLinks : (data.youtubeLink ? [data.youtubeLink] : [])
            setYoutubeLinks([0, 1, 2, 3].map((idx) => links[idx] || ''))
            setCurrentVideoIds(Array.isArray(data.videoIds) ? data.videoIds : (data.videoId ? [data.videoId] : []))
        } catch (error) {
            console.error('Error fetching live settings:', error)
            showToast('Failed to fetch live settings', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchLiveSettings()
    }, [fetchLiveSettings])

    const handleSave = async () => {
        try {
            setSaving(true)
            const response = await fetch('/api/admin/settings/live', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ youtubeLinks }),
            })

            const data = await response.json()

            if (response.ok) {
                showToast('Live stream links updated successfully', 'success')
                setCurrentVideoIds(Array.isArray(data.videoIds) ? data.videoIds : (data.videoId ? [data.videoId] : []))
            } else {
                showToast(data.error || 'Failed to update link', 'error')
            }
        } catch (error) {
            console.error('Error updating live settings:', error)
            showToast('An error occurred while saving', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveLive = async (index: number) => {
        try {
            setSaving(true)
            const updatedLinks = [...youtubeLinks]
            updatedLinks[index] = ''
            const response = await fetch('/api/admin/settings/live', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ youtubeLinks: updatedLinks }),
            })

            const data = await response.json()
            if (response.ok) {
                setYoutubeLinks(updatedLinks)
                setCurrentVideoIds(Array.isArray(data.videoIds) ? data.videoIds : (data.videoId ? [data.videoId] : []))
                showToast(`Live stream ${index + 1} removed successfully`, 'success')
            } else {
                showToast(data.error || 'Failed to remove live stream', 'error')
            }
        } catch (error) {
            console.error('Error removing live settings:', error)
            showToast('An error occurred while removing live stream', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-orange-700 font-serif">Live Stream Settings</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage YouTube live streams</p>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                href="/publisher/dashboard"
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-orange-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">YouTube Live Embed</h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Add up to 4 YouTube live URLs. All valid links will be shown on the /live page.
                        Leave unused fields empty.
                    </p>

                    <div className="space-y-4">
                        {youtubeLinks.map((link, idx) => (
                            <div key={`live-link-${idx}`} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={link}
                                    onChange={(e) => {
                                        const nextLinks = [...youtubeLinks]
                                        nextLinks[idx] = e.target.value
                                        setYoutubeLinks(nextLinks)
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                                <button
                                    onClick={() => handleRemoveLive(idx)}
                                    disabled={saving || !link.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Update Live Stream
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {currentVideoIds.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentVideoIds.map((videoId) => (
                                <div key={videoId} className="aspect-video">
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                                        title="YouTube Live Preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentVideoIds.length === 0 && !loading && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mt-6">
                        No live stream currently active. Enter a YouTube URL above to start.
                    </div>
                )}
            </div>
        </div>
    )
}