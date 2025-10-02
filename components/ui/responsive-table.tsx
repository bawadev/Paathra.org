/**
 * Responsive Table Component
 * Automatically converts to card layout on mobile devices
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

export interface ResponsiveTableColumn {
  key: string
  label: string
  mobileLabel?: string // Optional shorter label for mobile
  priority: 'high' | 'medium' | 'low' // Determines visibility on mobile
  render?: (value: any, row: any) => React.ReactNode
  className?: string
}

export interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  data: any[]
  keyField?: string
  mobileBreakpoint?: number // Default 768px
  className?: string
  emptyMessage?: string
  onRowClick?: (row: any) => void
  loading?: boolean
  // Table-specific props
  showTableOnMobile?: boolean // Force table view even on mobile
  stickyFirstColumn?: boolean // Make first column sticky on horizontal scroll
}

export function ResponsiveTable({
  columns,
  data,
  keyField = 'id',
  mobileBreakpoint = 768,
  className,
  emptyMessage = 'No data available',
  onRowClick,
  loading = false,
  showTableOnMobile = false,
  stickyFirstColumn = false,
}: ResponsiveTableProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }

    // Initial check
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])

  // Filter columns by priority for mobile
  const mobileColumns = columns.filter(col => col.priority === 'high')
  const displayColumns = isMobile && !showTableOnMobile ? mobileColumns : columns

  // Loading state
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        Loading...
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground border border-dashed rounded-lg">
        {emptyMessage}
      </div>
    )
  }

  // Mobile Card View
  if (isMobile && !showTableOnMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((row, index) => (
          <Card
            key={row[keyField] || index}
            className={cn(
              'p-4 space-y-3',
              onRowClick && 'cursor-pointer hover:bg-accent/50 transition-colors'
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => {
              const value = row[column.key]
              const displayValue = column.render ? column.render(value, row) : value

              // Skip if no value and not high priority
              if (!value && column.priority !== 'high') return null

              return (
                <div key={column.key} className="flex justify-between items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                    {column.mobileLabel || column.label}
                  </span>
                  <span className={cn('text-sm text-right flex-1', column.className)}>
                    {displayValue || '-'}
                  </span>
                </div>
              )
            })}
          </Card>
        ))}
      </div>
    )
  }

  // Desktop Table View
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((column, index) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.className,
                  stickyFirstColumn && index === 0 && 'sticky left-0 bg-background z-10'
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row[keyField] || rowIndex}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row)}
            >
              {displayColumns.map((column, colIndex) => {
                const value = row[column.key]
                const displayValue = column.render ? column.render(value, row) : value

                return (
                  <TableCell
                    key={column.key}
                    className={cn(
                      column.className,
                      stickyFirstColumn && colIndex === 0 && 'sticky left-0 bg-background z-10'
                    )}
                  >
                    {displayValue || '-'}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Export a hook for checking mobile state
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

// Utility function to create column definitions
export function createTableColumn(
  key: string,
  label: string,
  options?: {
    mobileLabel?: string
    priority?: 'high' | 'medium' | 'low'
    render?: (value: any, row: any) => React.ReactNode
    className?: string
  }
): ResponsiveTableColumn {
  return {
    key,
    label,
    mobileLabel: options?.mobileLabel,
    priority: options?.priority || 'medium',
    render: options?.render,
    className: options?.className,
  }
}
