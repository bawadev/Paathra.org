'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border',
        default: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-2',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Text to display alongside the spinner
   */
  text?: string
  /**
   * Position of the text relative to spinner
   */
  textPosition?: 'right' | 'bottom'
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, textPosition = 'right', ...props }, ref) => {
    if (text) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-3',
            textPosition === 'bottom' && 'flex-col gap-2',
            className
          )}
          {...props}
        >
          <div className={spinnerVariants({ size, variant })} />
          <span className="text-sm text-muted-foreground animate-pulse">
            {text}
          </span>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      />
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner, spinnerVariants }