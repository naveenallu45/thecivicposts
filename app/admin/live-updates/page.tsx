'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import YouTubeIcon from '@mui/icons-material/YouTube'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

export default function LiveUpdatesPage() {
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress color="primary" />
            </Box>
        )
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MuiLink component={Link} href="/admin/dashboard" underline="hover" color="inherit">
                        Dashboard
                    </MuiLink>
                    <Typography color="text.primary">Live Updates</Typography>
                </Breadcrumbs>

                <Box display="flex" alignItems="center" gap={2}>
                    <Button component={Link} href="/admin/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" size="small">
                        Back
                    </Button>
                    <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                        Live Stream Settings
                    </Typography>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px solid', borderColor: 'orange.100', mb: 4 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <YouTubeIcon sx={{ color: '#ff0000', fontSize: 32 }} />
                    <Typography variant="h6">YouTube Live Embed</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Add up to 4 YouTube live URLs. All valid links will be shown on the &quot;/live&quot; page.
                    Leave unused fields empty.
                </Typography>

                {youtubeLinks.map((link, idx) => (
                    <Box key={`live-link-${idx}`} display="flex" gap={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label={`YouTube Live URL ${idx + 1}`}
                            variant="outlined"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={link}
                            onChange={(e) => {
                                const nextLinks = [...youtubeLinks]
                                nextLinks[idx] = e.target.value
                                setYoutubeLinks(nextLinks)
                            }}
                        />
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveLive(idx)}
                            disabled={saving || !link.trim()}
                            sx={{ minWidth: 132, height: 56 }}
                        >
                            Remove
                        </Button>
                    </Box>
                ))}

                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #ea580c 30%, #f97316 90%)',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #d9480f 30%, #ea580c 90%)',
                            }
                        }}
                    >
                        {saving ? 'Updating...' : 'Update Live Stream'}
                    </Button>
                </Box>
            </Paper>

            {currentVideoIds.length > 0 && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" mb={2}>Preview</Typography>
                    {currentVideoIds.map((videoId) => (
                        <Box key={videoId} sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 2, mb: 2 }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                                title="YouTube Live Preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </Box>
                    ))}
                </Paper>
            )}

            {currentVideoIds.length === 0 && !loading && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No live stream currently active. Enter a YouTube URL above to start.
                </Alert>
            )}
        </Container>
    )
}
