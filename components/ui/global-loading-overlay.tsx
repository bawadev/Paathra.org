'use client'

import { useLoading } from '@/lib/loading-system'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GlobalLoadingOverlayProps {
  className?: string
}

export function GlobalLoadingOverlay({ className }: GlobalLoadingOverlayProps) {
  const { operations, isLoading } = useLoading()
  const [show, setShow] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<string>('')

  useEffect(() => {
    const hasActiveOperations = isLoading()
    
    if (hasActiveOperations) {
      // Get the most recent operation
      const activeOps = operations.filter(op => op.state === 'loading')
      if (activeOps.length > 0) {
        setCurrentOperation(activeOps[activeOps.length - 1].label)
      }
      setShow(true)
      return
    }
    
    // Add a small delay before hiding to prevent flickering
    const timer = setTimeout(() => {
      setShow(false)
      setCurrentOperation('')
    }, 150)
    return () => clearTimeout(timer)
  }, [isLoading, operations])

  if (!show) return null

  return (
    <div 
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none',
        'loading-overlay-backdrop',
        className
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Loading Panel */}
      <div className={cn(
        'relative flex flex-col items-center justify-center',
        'w-32 h-32 rounded-full',
        'glass-loading loading-overlay-panel',
        'shadow-2xl'
      )}>
        {/* Spinning Loader */}
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        
        {/* Loading Text */}
        {currentOperation && (
          <p className="text-xs text-gray-600 text-center px-2 font-medium max-w-24 leading-tight">
            {currentOperation.length > 20 ? `${currentOperation.slice(0, 20)}...` : currentOperation}
          </p>
        )}
        
        {/* Animated Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/30 loading-overlay-spinner" />
      </div>
    </div>
  )
}

// Custom hook to trigger loading for page transitions
export function usePageTransition() {
  const { startLoading, completeLoading } = useLoading()
  
  const startTransition = (label: string = 'Loading page...') => {
    startLoading('page-transition', label)
  }
  
  const completeTransition = () => {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      completeLoading('page-transition')
    }, 100)
  }
  
  return { startTransition, completeTransition }
}

// Hook for form submissions
export function useFormSubmission() {
  const { startLoading, completeLoading, failLoading } = useLoading()
  
  const startSubmission = (label: string = 'Submitting...') => {
    startLoading('form-submission', label)
  }
  
  const completeSubmission = () => {
    setTimeout(() => {
      completeLoading('form-submission')
    }, 100)
  }
  
  const failSubmission = () => {
    failLoading('form-submission')
  }
  
  return { startSubmission, completeSubmission, failSubmission }
}
