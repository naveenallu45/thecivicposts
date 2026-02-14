'use client'

import { useState } from 'react'
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid'
import { Box, Chip, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useRouter } from 'next/navigation'
import ConfirmDialog from './ConfirmDialog'

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

export default function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; articleId: string | null }>({
    isOpen: false,
    articleId: null,
  })

  const handleEdit = (id: string) => {
    router.push(`/admin/articles/${id}`)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ isOpen: true, articleId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.articleId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/articles/${deleteDialog.articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      router.refresh()
      setDeleteDialog({ isOpen: false, articleId: null })
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, articleId: null })
  }

  const handleToggleField = async (id: string, field: 'isTopStory' | 'isMiniTopStory' | 'isLatest' | 'isTrending', currentValue: boolean) => {
    setLoading(true)
    try {
      const newValue = !currentValue
      
      // If setting to true, set all other fields to false (only one can be true at a time)
      const updateData: Record<string, boolean> = {
        [field]: newValue,
      }
      
      if (newValue) {
        // Set all other fields to false
        const allFields: Array<'isTopStory' | 'isMiniTopStory' | 'isLatest' | 'isTrending'> = [
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

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update ${field}`)
      }

      router.refresh()
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      alert(`Failed to update ${field}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const columns: GridColDef[] = [
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
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleField(params.row.id, 'isTopStory', params.value)
          }}
          sx={{ 
            cursor: 'pointer',
            fontWeight: params.value ? 600 : 400,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      ),
    },
    {
      field: 'isMiniTopStory',
      headerName: 'Mini Top Story',
      flex: 1,
      minWidth: 120,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleField(params.row.id, 'isMiniTopStory', params.value)
          }}
          sx={{ 
            cursor: 'pointer',
            fontWeight: params.value ? 600 : 400,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      ),
    },
    {
      field: 'isLatest',
      headerName: 'Latest',
      flex: 0.7,
      minWidth: 80,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleField(params.row.id, 'isLatest', params.value)
          }}
          sx={{ 
            cursor: 'pointer',
            fontWeight: params.value ? 600 : 400,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      ),
    },
    {
      field: 'isTrending',
      headerName: 'Trending',
      flex: 0.8,
      minWidth: 90,
      type: 'boolean',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleField(params.row.id, 'isTrending', params.value)
          }}
          sx={{ 
            cursor: 'pointer',
            fontWeight: params.value ? 600 : 400,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      ),
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
  ]

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
        rows={articles}
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
