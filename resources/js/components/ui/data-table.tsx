import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Filter, Download, RefreshCw, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardHeader } from './card'
import { Skeleton } from './skeleton'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  title: string
  dataIndex: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  emptyMessage?: string
  className?: string
  rowKey?: string
  onRowClick?: (record: T, index: number) => void
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
  title?: string
  description?: string
  showActions?: boolean
  onRefresh?: () => void
  onExport?: () => void
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  emptyMessage = "No data available",
  className,
  rowKey = "id",
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  title,
  description,
  showActions = true,
  onRefresh,
  onExport,
  pagination
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('')
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRowSelection = (record: T, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedRows, record])
    } else {
      onSelectionChange(selectedRows.filter(item => item[rowKey] !== record[rowKey]))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? data : [])
  }

  const isAllSelected = data.length > 0 && selectedRows.length === data.length
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {/* Header */}
      {(title || description || showActions) && (
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Search and Filters */}
      {searchable && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              {selectedRows.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedRows.length} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2">No data available</div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  {selectable && (
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-input"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "p-4 text-left font-semibold text-gray-700",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right",
                        column.width && `w-[${column.width}]`
                      )}
                    >
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.dataIndex)}
                          className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                        >
                          {column.title}
                          <div className="flex flex-col">
                            <ChevronUp className={cn(
                              "h-3 w-3 transition-colors",
                              sortField === column.dataIndex && sortDirection === 'asc' 
                                ? "text-blue-600" 
                                : "text-gray-400 group-hover:text-blue-400"
                            )} />
                            <ChevronDown className={cn(
                              "h-3 w-3 -mt-1 transition-colors",
                              sortField === column.dataIndex && sortDirection === 'desc' 
                                ? "text-blue-600" 
                                : "text-gray-400 group-hover:text-blue-400"
                            )} />
                          </div>
                        </button>
                      ) : (
                        column.title
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((record, index) => (
                  <tr
                    key={record[rowKey]}
                    className={cn(
                      "hover:bg-blue-50/50 transition-colors group",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {selectable && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.some(item => item[rowKey] === record[rowKey])}
                          onChange={(e) => handleRowSelection(record, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-input"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "p-4 text-sm",
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(record[column.dataIndex], record, index)
                          : record[column.dataIndex] || '—'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
          <div className="text-sm text-gray-600">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === Math.ceil(pagination.total / pagination.pageSize) || 
                  Math.abs(page - pagination.current) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Button
                      variant={page === pagination.current ? "default" : "outline"}
                      size="sm"
                      onClick={() => pagination.onChange(page, pagination.pageSize)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
