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

export default function LiveUpdatesPage() {
    const [youtubeLink, setYoutubeLink] = useState('')
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { showToast } = useToast()

    const fetchLiveSettings = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/settings/live')
            const data = await response.json()
            if (data.youtubeLink) {
                setYoutubeLink(data.youtubeLink)
                setCurrentVideoId(data.videoId)
            }
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
                body: JSON.stringify({ youtubeLink }),
            })

            const data = await response.json()

            if (response.ok) {
                showToast('Live stream link updated successfully', 'success')
                setCurrentVideoId(data.videoId)
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
                    Enter the YouTube URL for the live stream. This will be embedded on the &quot;/live&quot; page for all users.
                    Supported formats: Full YouTube URL, shortened youtu.be link, or embed URL.
                </Typography>

                <TextField
                    fullWidth
                    label="YouTube Live URL"
                    variant="outlined"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    sx={{ mb: 3 }}
                />

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
            </Paper>

            {currentVideoId && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" mb={2}>Preview</Typography>
                    <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 2 }}>
                        <iframe
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0`}
                            title="YouTube Live Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </Box>
                </Paper>
            )}

            {!currentVideoId && !loading && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No live stream currently active. Enter a YouTube URL above to start.
                </Alert>
            )}
        </Container>
    )
}
