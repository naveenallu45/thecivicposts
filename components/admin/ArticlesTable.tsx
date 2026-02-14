'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid'
import { Box, Chip, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useRouter } from 'next/navigation'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'

interface ArticleRow {
  id: string
  title: string
  author: string
  publishedDate: string
  createdAt: string
  isTopStory: boolean
  isMiniTopStory: boolean
  isLatest: boolean
  isTrending: boolean
  status: 'draft' | 'published'
  category: string
  type: string
}

interface ArticlesTableProps {
  articles: ArticleRow[]
}

type FieldType = 'isTopStory' | 'isMiniTopStory' | 'isLatest' | 'isTrending'

interface LoadingState {
  [key: string]: boolean
}

const API_TIMEOUT = 10000 // 10 seconds
const DEBOUNCE_DELAY = 300 // 300ms debounce

export default function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rowLoading, setRowLoading] = useState<LoadingState>({})
  const [localArticles, setLocalArticles] = useState<ArticleRow[]>(articles)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; articleId: string | null }>({
    isOpen: false,
    articleId: null,
  })
  
  // Track pending requests to prevent race conditions
  const pendingRequestsRef = useRef<Map<string, AbortController>>(new Map())
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Update local articles when props change
  useEffect(() => {
    setLocalArticles(articles)
  }, [articles])

  // Cleanup on unmount
  useEffect(() => {
    const pendingRequests = pendingRequestsRef.current
    const debounceTimers = debounceTimersRef.current
    
    return () => {
      // Cancel all pending requests
      pendingRequests.forEach((controller) => {
        controller.abort()
      })
      // Clear all debounce timers
      debounceTimers.forEach((timer) => {
        clearTimeout(timer)
      })
    }
  }, [])

  const handleEdit = useCallback((id: string) => {
    // Prefetch the edit page data
    router.prefetch(`/admin/articles/${id}`)
    router.push(`/admin/articles/${id}`)
  }, [router])

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ isOpen: true, articleId: id })
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.articleId) return

    setLoading(true)
    const articleId = deleteDialog.articleId
    
    try {
      // Create abort controller for request cancellation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete article')
      }

      // Optimistically remove from local state
      setLocalArticles((prev) => prev.filter((article) => article.id !== articleId))
      showToast('Article deleted successfully!', 'success')
      
      // Refresh in background
      router.refresh()
      setDeleteDialog({ isOpen: false, articleId: null })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        showToast('Request timed out. Please try again.', 'error')
      } else {
        console.error('Error deleting article:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete article. Please try again.'
        showToast(errorMessage, 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [deleteDialog.articleId, router, showToast])

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, articleId: null })
  }

  const handleToggleField = useCallback(async (
    id: string, 
    field: FieldType, 
    currentValue: boolean
  ) => {
    const requestKey = `${id}-${field}`
    
    // Cancel previous pending request for this field
    const existingController = pendingRequestsRef.current.get(requestKey)
    if (existingController) {
      existingController.abort()
      pendingRequestsRef.current.delete(requestKey)
    }

    // Clear existing debounce timer
    const existingTimer = debounceTimersRef.current.get(requestKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const newValue = !currentValue
    
    // Store original state for rollback
    const originalArticle = localArticles.find((a) => a.id === id)
    if (!originalArticle) return

    // Optimistically update UI immediately
    setLocalArticles((prevArticles) => {
      return prevArticles.map((article) => {
        if (article.id === id) {
          const updated = { ...article, [field]: newValue }
          
          // If setting to true, set all other fields to false
          if (newValue) {
            updated.isTopStory = field === 'isTopStory'
            updated.isMiniTopStory = field === 'isMiniTopStory'
            updated.isLatest = field === 'isLatest'
            updated.isTrending = field === 'isTrending'
          }
          
          return updated
        }
        return article
      })
    })

    // Set loading state for this specific row/field
    setRowLoading((prev) => ({ ...prev, [requestKey]: true }))

    // Debounce the API call
    const timer = setTimeout(async () => {
      const controller = new AbortController()
      pendingRequestsRef.current.set(requestKey, controller)
      
      try {
        // Prepare update data
        const updateData: Record<string, boolean> = {
          [field]: newValue,
        }
        
        if (newValue) {
          // Set all other fields to false
          const allFields: FieldType[] = [
            'isTopStory',
            'isMiniTopStory',
            'isLatest',
            'isTrending',
          ]
          
          allFields.forEach((f) => {
            if (f !== field) {
              updateData[f] = false
            }
          })
        }

        // Create timeout for request
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

        const response = await fetch(`/api/admin/articles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        pendingRequestsRef.current.delete(requestKey)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to update ${field}`)
        }

        const fieldLabels: Record<FieldType, string> = {
          isTopStory: 'Top Story',
          isMiniTopStory: 'Mini Top Story',
          isLatest: 'Latest',
          isTrending: 'Trending',
        }

        showToast(
          `${fieldLabels[field]} ${newValue ? 'enabled' : 'disabled'} successfully!`, 
          'success'
        )
        
        // Silent refresh in background
        router.refresh()
      } catch (error) {
        pendingRequestsRef.current.delete(requestKey)
        
        if (error instanceof Error && error.name === 'AbortError') {
          if (controller.signal.aborted) {
            showToast('Request timed out. Please try again.', 'error')
          } else {
            // Request was cancelled, don't show error
            return
          }
        } else {
          console.error(`Error updating ${field}:`, error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : `Failed to update ${field}. Please try again.`
          showToast(errorMessage, 'error')
        }
        
        // Revert optimistic update on error
        setLocalArticles((prevArticles) => {
          return prevArticles.map((article) => {
            if (article.id === id && originalArticle) {
              return { ...originalArticle }
            }
            return article
          })
        })
      } finally {
        setRowLoading((prev) => {
          const updated = { ...prev }
          delete updated[requestKey]
          return updated
        })
        debounceTimersRef.current.delete(requestKey)
      }
    }, DEBOUNCE_DELAY)

    debounceTimersRef.current.set(requestKey, timer)
  }, [localArticles, router, showToast])

  // Memoize columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'title',
      headerName: 'Title',
      flex: 2,
      minWidth: 250,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => (
        <div className="w-full">
          <Tooltip title={params.value} arrow>
            <span className="truncate font-semibold text-gray-900 block text-left">{params.value}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      field: 'author',
      headerName: 'Author',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span className="text-gray-700 font-medium">{params.value}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.9,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'published' ? 'Published' : 'Draft'}
          color={params.value === 'published' ? 'success' : 'warning'}
          size="small"
          icon={params.value === 'published' ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
          sx={{
            fontWeight: 500,
            '& .MuiChip-icon': {
              fontSize: '1rem',
            },
          }}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const typeLabels: Record<string, string> = {
          'news': 'News',
          'entertainment': 'Entertainment',
          'sports': 'Sports',
          'health-fitness': 'Health & Fitness',
          'editorial': 'Editorial',
        }
        const label = typeLabels[params.value] || params.value
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              fontWeight: 500,
              backgroundColor: '#f3f4f6',
              color: '#374151',
              textTransform: 'capitalize',
            }}
          />
        )
      },
    },
    {
      field: 'publishedDate',
      headerName: 'Published On',
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span className="text-gray-600 text-sm font-medium">{params.value}</span>
      ),
    },
    {
      field: 'isTopStory',
      headerName: 'Top Story',
      flex: 0.8,
      minWidth: 100,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isLoading = rowLoading[`${params.row.id}-isTopStory`] || false
        return (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            color={params.value ? 'primary' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (!isLoading) {
                handleToggleField(params.row.id, 'isTopStory', params.value)
              }
            }}
            disabled={isLoading}
            sx={{ 
              cursor: isLoading ? 'wait' : 'pointer',
              fontWeight: params.value ? 600 : 400,
              opacity: isLoading ? 0.6 : 1,
              '&:hover': {
                opacity: isLoading ? 0.6 : 0.8,
              },
            }}
          />
        )
      },
    },
    {
      field: 'isMiniTopStory',
      headerName: 'Mini Top Story',
      flex: 1,
      minWidth: 120,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isLoading = rowLoading[`${params.row.id}-isMiniTopStory`] || false
        return (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            color={params.value ? 'primary' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (!isLoading) {
                handleToggleField(params.row.id, 'isMiniTopStory', params.value)
              }
            }}
            disabled={isLoading}
            sx={{ 
              cursor: isLoading ? 'wait' : 'pointer',
              fontWeight: params.value ? 600 : 400,
              opacity: isLoading ? 0.6 : 1,
              '&:hover': {
                opacity: isLoading ? 0.6 : 0.8,
              },
            }}
          />
        )
      },
    },
    {
      field: 'isLatest',
      headerName: 'Latest',
      flex: 0.7,
      minWidth: 80,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isLoading = rowLoading[`${params.row.id}-isLatest`] || false
        return (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            color={params.value ? 'primary' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (!isLoading) {
                handleToggleField(params.row.id, 'isLatest', params.value)
              }
            }}
            disabled={isLoading}
            sx={{ 
              cursor: isLoading ? 'wait' : 'pointer',
              fontWeight: params.value ? 600 : 400,
              opacity: isLoading ? 0.6 : 1,
              '&:hover': {
                opacity: isLoading ? 0.6 : 0.8,
              },
            }}
          />
        )
      },
    },
    {
      field: 'isTrending',
      headerName: 'Trending',
      flex: 0.8,
      minWidth: 90,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isLoading = rowLoading[`${params.row.id}-isTrending`] || false
        return (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            color={params.value ? 'primary' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (!isLoading) {
                handleToggleField(params.row.id, 'isTrending', params.value)
              }
            }}
            disabled={isLoading}
            sx={{ 
              cursor: isLoading ? 'wait' : 'pointer',
              fontWeight: params.value ? 600 : 400,
              opacity: isLoading ? 0.6 : 1,
              '&:hover': {
                opacity: isLoading ? 0.6 : 0.8,
              },
            }}
          />
        )
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" sx={{ color: '#1976d2' }} />}
          label="Edit Article"
          onClick={() => handleEdit(params.id as string)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />}
          label="Delete Article"
          onClick={() => handleDeleteClick(params.id as string)}
          showInMenu={false}
        />,
      ],
    },
  ], [handleToggleField, handleEdit, rowLoading])

  return (
    <Box 
      sx={{ 
        height: 700, 
        width: '100%', 
        maxWidth: '100%',
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid #1f2937',
      }}
    >
      <DataGrid
        rows={localArticles}
        columns={columns}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        // Note: Articles are already sorted by createdAt descending (newest first) from server
        // Since sorting is disabled, DataGrid displays rows in the order provided
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        disableColumnSorting
        loading={loading}
                sx={{
                  border: 'none',
                  width: '100%',
                  overflowX: 'hidden',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                    width: '100%',
                    overflowX: 'hidden',
                  },
                  '& .MuiDataGrid-main': {
                    overflowX: 'hidden !important',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowX: 'hidden !important',
                  },
                  '& .MuiDataGrid-virtualScrollerContent': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                  },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
            borderBottom: '1px solid #e5e7eb',
            borderRight: '1px solid #e5e7eb',
            padding: '14px 18px',
            color: '#374151',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-cell[data-field="author"], & .MuiDataGrid-cell[data-field="status"], & .MuiDataGrid-cell[data-field="type"], & .MuiDataGrid-cell[data-field="publishedDate"], & .MuiDataGrid-cell[data-field="isTopStory"], & .MuiDataGrid-cell[data-field="isMiniTopStory"], & .MuiDataGrid-cell[data-field="isLatest"], & .MuiDataGrid-cell[data-field="isTrending"], & .MuiDataGrid-cell[data-field="actions"]': {
            justifyContent: 'center',
          },
          '& .MuiDataGrid-cell[data-field="title"]': {
            justifyContent: 'flex-start',
            textAlign: 'left',
          },
          '& .MuiDataGrid-cell:last-of-type': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: '#f3f4f6',
            borderBottom: '2px solid #1f2937',
            borderRight: '1px solid #e5e7eb',
            padding: '16px 18px',
            color: '#111827',
            letterSpacing: '0.025em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeader[data-field="author"], & .MuiDataGrid-columnHeader[data-field="status"], & .MuiDataGrid-columnHeader[data-field="type"], & .MuiDataGrid-columnHeader[data-field="publishedDate"], & .MuiDataGrid-columnHeader[data-field="isTopStory"], & .MuiDataGrid-columnHeader[data-field="isMiniTopStory"], & .MuiDataGrid-columnHeader[data-field="isLatest"], & .MuiDataGrid-columnHeader[data-field="isTrending"], & .MuiDataGrid-columnHeader[data-field="actions"]': {
            justifyContent: 'center',
          },
          '& .MuiDataGrid-columnHeader[data-field="title"]': {
            justifyContent: 'flex-start',
            textAlign: 'left',
          },
          '& .MuiDataGrid-columnHeader:last-of-type': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid #e5e7eb',
            '&:hover': {
              backgroundColor: '#f9fafb',
              transition: 'background-color 0.2s ease',
            },
            '&:nth-of-type(even)': {
              backgroundColor: '#fafafa',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            },
            '&.Mui-selected': {
              backgroundColor: '#fef3c7',
              '&:hover': {
                backgroundColor: '#fde68a',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #1f2937',
            backgroundColor: '#f9fafb',
            minHeight: '56px',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '16px 18px',
            backgroundColor: '#f9fafb',
            borderBottom: '2px solid #1f2937',
          },
          '& .MuiDataGrid-actionsCell': {
            gap: '8px',
          },
          '& .MuiDataGrid-sortIcon': {
            color: '#6b7280',
          },
          '& .MuiDataGrid-menuIcon': {
            color: '#6b7280',
          },
          '& .MuiDataGrid-selectedRowCount': {
            color: '#111827',
            fontWeight: 500,
          },
        }}
      />
      
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </Box>
  )
}
