/**
 * Enhanced Loading States System
 * 
 * Provides consistent loading patterns, skeleton loaders, and progress indicators
 * across the entire application.
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingOperation {
  id: string
  label: string
  progress?: number
  state: LoadingState
  startTime: Date
  endTime?: Date
}

interface LoadingContextType {
  operations: LoadingOperation[]
  isLoading: (operationId?: string) => boolean
  startLoading: (operationId: string, label: string) => void
  updateProgress: (operationId: string, progress: number) => void
  completeLoading: (operationId: string) => void
  failLoading: (operationId: string) => void
  clearOperation: (operationId: string) => void
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [operations, setOperations] = useState<LoadingOperation[]>([])

  const isLoading = useCallback((operationId?: string) => {
    if (operationId) {
      const operation = operations.find(op => op.id === operationId)
      return operation?.state === 'loading'
    }
    return operations.some(op => op.state === 'loading')
  }, [operations])

  const startLoading = useCallback((operationId: string, label: string) => {
    setOperations(prev => {
      const filtered = prev.filter(op => op.id !== operationId)
      return [...filtered, {
        id: operationId,
        label,
        state: 'loading' as LoadingState,
        startTime: new Date()
      }]
    })
  }, [])

  const updateProgress = useCallback((operationId: string, progress: number) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, progress: Math.min(100, Math.max(0, progress)) }
        : op
    ))
  }, [])

  const completeLoading = useCallback((operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, state: 'success' as LoadingState, endTime: new Date() }
        : op
    ))
  }, [])

  const failLoading = useCallback((operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, state: 'error' as LoadingState, endTime: new Date() }
        : op
    ))
  }, [])

  const clearOperation = useCallback((operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId))
  }, [])

  const value: LoadingContextType = {
    operations,
    isLoading,
    startLoading,
    updateProgress,
    completeLoading,
    failLoading,
    clearOperation
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

/**
 * Enhanced Loading Spinner Component
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'lotus'
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className,
  label 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  if (variant === 'lotus') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className={cn('lotus-icon animate-spin', sizeClasses[size])} />
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'bg-primary rounded-full animate-pulse',
                size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className={cn(
          'bg-primary rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          sizeClasses[size]
        )}
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
  className?: string
  variant?: 'default' | 'gradient' | 'striped'
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true,
  className,
  variant = 'default'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress))

  const variantClasses = {
    default: 'bg-primary',
    gradient: 'bg-gradient-to-r from-primary to-accent',
    striped: 'bg-primary bg-stripes'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Skeleton Loader Components
 */
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circle' | 'rectangle'
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'rectangle',
  lines = 1 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circle') {
    return (
      <div className={cn(baseClasses, 'rounded-full w-12 h-12', className)} />
    )
  }

  return (
    <div className={cn(baseClasses, 'w-full h-32', className)} />
  )
}

/**
 * Card Skeleton for common card layouts
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border border-gray-200 rounded-lg space-y-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <Skeleton variant="rectangle" className="h-24" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
  isLoading: boolean
  children: ReactNode
  spinner?: ReactNode
  className?: string
  message?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  spinner,
  className,
  message = 'Loading...'
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          {spinner || <LoadingSpinner variant="lotus" label={message} />}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for managing operation loading states
 */
export function useOperationLoading(operationId: string) {
  const { 
    isLoading, 
    startLoading, 
    updateProgress, 
    completeLoading, 
    failLoading,
    clearOperation 
  } = useLoading()

  const executeWithLoading = useCallback(async (
    operation: () => Promise<any>,
    label: string = 'Loading...'
  ): Promise<any> => {
    try {
      startLoading(operationId, label)
      const result = await operation()
      completeLoading(operationId)
      return result
    } catch (error: any) {
      failLoading(operationId)
      throw error
    }
  }, [operationId, startLoading, completeLoading, failLoading])

  return {
    isLoading: isLoading(operationId),
    executeWithLoading,
    updateProgress: (progress: number) => updateProgress(operationId, progress),
    complete: () => completeLoading(operationId),
    fail: () => failLoading(operationId),
    clear: () => clearOperation(operationId)
  }
}

/**
 * HOC for adding loading states to components
 */
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  operationId: string,
  loadingComponent?: React.ComponentType
) {
  return function LoadingWrapper(props: P) {
    const { isLoading } = useLoading()
    
    if (isLoading(operationId)) {
      if (loadingComponent) {
        const LoadingComponent = loadingComponent
        return <LoadingComponent />
      }
      return <LoadingSpinner variant="lotus" label="Loading component..." />
    }
    
    return <Component {...props} />
  }
}
