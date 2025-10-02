import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'spiritual' | 'compassion' | 'trust'
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'default'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const variantClasses = {
    default: 'text-primary',
    spiritual: 'text-spiritual-500',
    compassion: 'text-compassion-500',
    trust: 'text-trust-500',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin transition-all duration-300',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={{
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
  variant?: 'default' | 'spiritual' | 'compassion' | 'trust'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function LoadingState({
  message = 'Loading...',
  className,
  variant = 'default',
  size = 'lg'
}: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="flex flex-col items-center gap-4 animate-dana-fade-in">
        <div className="relative">
          <LoadingSpinner size={size} variant={variant} />
          {/* Decorative ring */}
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-20 animate-ping',
              variant === 'default' && 'bg-primary',
              variant === 'spiritual' && 'bg-spiritual-500',
              variant === 'compassion' && 'bg-compassion-500',
              variant === 'trust' && 'bg-trust-500'
            )}
            style={{
              animationDuration: '2s',
              animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
        {message && (
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

interface PageLoadingProps {
  message?: string
  variant?: 'default' | 'spiritual' | 'compassion' | 'trust'
}

export function PageLoading({
  message = 'Loading page...',
  variant = 'default'
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-dana-fade-in">
        <LoadingState message={message} variant={variant} size="xl" />
        {/* Decorative elements */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }} />
        </div>
      </div>
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
      {message && <span className="text-caption">{message}</span>}
    </div>
  )
}
