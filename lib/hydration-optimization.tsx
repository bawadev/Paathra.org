'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

/**
 * Hook to handle client-side hydration optimization
 * Prevents hydration mismatches and provides loading states
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Component wrapper that only renders children after hydration
 * Useful for components that depend on browser APIs or client-side state
 */
interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const isHydrated = useHydration()

  if (!isHydrated) {
    return fallback || <LoadingSpinner />
  }

  return <>{children}</>
}

/**
 * Hook for components that need to wait for specific browser APIs
 */
export function useBrowserAPI<T>(
  apiGetter: () => T | null,
  dependencies: any[] = []
): T | null {
  const [api, setApi] = useState<T | null>(null)
  const isHydrated = useHydration()

  useEffect(() => {
    if (isHydrated) {
      const result = apiGetter()
      setApi(result)
    }
  }, [isHydrated, ...dependencies])

  return api
}

/**
 * Hook for geolocation API with hydration safety
 */
export function useGeolocation() {
  return useBrowserAPI(() => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
      ? navigator.geolocation
      : null
  })
}

/**
 * Hook for localStorage with hydration safety
 */
export function useLocalStorage() {
  return useBrowserAPI(() => {
    return typeof window !== 'undefined' ? window.localStorage : null
  })
}

/**
 * Component for interactive maps that need client-side rendering
 */
interface InteractiveWrapperProps {
  children: React.ReactNode
  loadingMessage?: string
}

export function InteractiveWrapper({ 
  children, 
  loadingMessage = "Loading interactive content..." 
}: InteractiveWrapperProps) {
  const isHydrated = useHydration()

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Higher-order component for optimizing client-side components
 */
export function withClientOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode
    loadingMessage?: string
  } = {}
) {
  return function OptimizedComponent(props: P) {
    return (
      <ClientOnly fallback={options.fallback}>
        <InteractiveWrapper loadingMessage={options.loadingMessage || "Loading interactive content..."}>
          <Component {...props} />
        </InteractiveWrapper>
      </ClientOnly>
    )
  }
}