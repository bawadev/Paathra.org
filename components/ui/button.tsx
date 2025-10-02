'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/design-system/components/variants/button"

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      cultural,
      context,
      accessibility,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ripple = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    // Handle click with ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        createRippleEffect(e)
      }
      onClick?.(e)
    }

    // Create ripple effect for enhanced interaction
    const createRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget
      const circle = document.createElement('span')
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2

      const rect = button.getBoundingClientRect()
      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${e.clientX - rect.left - radius}px`
      circle.style.top = `${e.clientY - rect.top - radius}px`
      circle.classList.add('dana-ripple')

      const existingRipple = button.getElementsByClassName('dana-ripple')[0]
      if (existingRipple) {
        existingRipple.remove()
      }

      button.appendChild(circle)

      // Remove ripple after animation
      setTimeout(() => {
        circle.remove()
      }, 600)
    }

    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({
            variant,
            size,
            animation,
            cultural,
            context,
            accessibility,
            className
          }),
          fullWidth && 'w-full',
          loading && 'pointer-events-none opacity-75',
          ripple && 'relative overflow-hidden'
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            {loadingText || children}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </div>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

// Loading spinner component
const LoadingSpinner = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6v-4z"
      />
    </svg>
  )
}

export { Button, buttonVariants }

// Add CSS for ripple effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .dana-ripple {
      position: absolute;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      transform: scale(0);
      animation: dana-ripple-animation 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    @keyframes dana-ripple-animation {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
