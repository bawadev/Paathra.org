'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface StyledNavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'trigger' | 'link' | 'button'
}

export const StyledNavButton = forwardRef<HTMLButtonElement, StyledNavButtonProps>(
  ({ className, variant = 'trigger', children, ...props }, ref) => {
    const baseClasses = "text-lg font-bold transition-all duration-300 rounded-md px-3 py-2 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:text-white hover:shadow-lg hover:translate-y-[-1px]"
    
    return (
      <button
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

StyledNavButton.displayName = 'StyledNavButton'

// Usage example for centralized styling
export const useNavStyling = () => ({
  navButton: "text-lg font-bold transition-all duration-300 rounded-md px-3 py-2 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:text-white hover:shadow-lg hover:translate-y-[-1px]",
  navLink: "px-3 py-2 rounded-md transition-all duration-300 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:text-white hover:shadow-lg",
  outlineButton: "border-2 border-[var(--primary-color)] text-[var(--primary-color)] transition-all duration-300 rounded-md hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:text-white hover:border-transparent hover:shadow-lg"
})