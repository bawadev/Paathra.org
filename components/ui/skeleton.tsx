import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of skeleton animation
   * - pulse: Gentle pulsing animation (default)
   * - wave: Elegant wave shimmer effect
   * - none: No animation
   */
  variant?: 'pulse' | 'wave' | 'none'
}

function Skeleton({
  className,
  variant = 'pulse',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        variant === 'pulse' && "animate-pulse",
        variant === 'wave' && "skeleton-wave",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card skeleton for monastery/donation cards
 */
function SkeletonCard() {
  return (
    <div className="dana-card p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" variant="wave" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" variant="wave" />
        <Skeleton className="h-4 w-full" variant="wave" />
        <Skeleton className="h-4 w-5/6" variant="wave" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" variant="wave" />
        <Skeleton className="h-10 w-24" variant="wave" />
      </div>
    </div>
  )
}

/**
 * List item skeleton
 */
function SkeletonListItem() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-border last:border-0">
      <Skeleton className="h-12 w-12 rounded-full" variant="wave" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" variant="wave" />
        <Skeleton className="h-3 w-3/4" variant="wave" />
      </div>
      <Skeleton className="h-8 w-20" variant="wave" />
    </div>
  )
}

/**
 * Table skeleton
 */
function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" variant="wave" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" variant="wave" />
      ))}
    </div>
  )
}

/**
 * Form skeleton
 */
function SkeletonForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" variant="wave" />
        <Skeleton className="h-10 w-full" variant="wave" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" variant="wave" />
        <Skeleton className="h-10 w-full" variant="wave" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" variant="wave" />
        <Skeleton className="h-24 w-full" variant="wave" />
      </div>
      <Skeleton className="h-10 w-full" variant="wave" />
    </div>
  )
}

/**
 * Avatar skeleton
 */
function SkeletonAvatar({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  return <Skeleton className={cn('rounded-full', sizeClasses[size])} variant="wave" />
}

/**
 * Text skeleton - for multiple lines of text
 */
function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-4/5' : 'w-full'
          )}
          variant="wave"
        />
      ))}
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTable,
  SkeletonForm,
  SkeletonAvatar,
  SkeletonText,
}

// Add wave animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .skeleton-wave {
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        90deg,
        oklch(0.96 0.01 85) 0%,
        oklch(0.98 0.005 85) 50%,
        oklch(0.96 0.01 85) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-wave-animation 1.5s ease-in-out infinite;
    }

    .dark .skeleton-wave {
      background: linear-gradient(
        90deg,
        oklch(0.22 0.02 240) 0%,
        oklch(0.25 0.02 240) 50%,
        oklch(0.22 0.02 240) 100%
      );
      background-size: 200% 100%;
    }

    @keyframes skeleton-wave-animation {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-wave {
        animation: none;
        background: oklch(0.96 0.01 85);
      }

      .dark .skeleton-wave {
        background: oklch(0.22 0.02 240);
      }
    }
  `
  document.head.appendChild(style)
}
