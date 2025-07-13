import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading page...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message={message} />
    </div>
  )
}

interface InlineLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function InlineLoading({ message, size = 'sm' }: InlineLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  )
}
