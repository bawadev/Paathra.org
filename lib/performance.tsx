/**
 * Performance Optimization System
 * 
 * Provides code splitting, lazy loading, and performance monitoring
 * for the Dhaana application.
 */

'use client'

import React, { 
  Suspense, 
  lazy, 
  ComponentType, 
  ReactNode, 
  useState, 
  useEffect, 
  useCallback 
} from 'react'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/lib/loading-system'

/**
 * Enhanced Dynamic Import with Error Boundary
 */
interface LazyComponentOptions {
  fallback?: ReactNode
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
  delay?: number
  timeout?: number
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    fallback = <LoadingSpinner variant="lotus" label="Loading component..." />,
    errorFallback: ErrorFallback,
    delay = 0,
    timeout = 10000
  } = options

  // Create the lazy component with timeout
  const LazyComponent = lazy(() => {
    return Promise.race([
      importFn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Component load timeout')), timeout)
      })
    ])
  })

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const retry = useCallback(() => {
      setHasError(false)
      setError(null)
    }, [])

    const handleError = useCallback((error: Error) => {
      setError(error)
      setHasError(true)
    }, [])

    if (hasError && error) {
      if (ErrorFallback) {
        return <ErrorFallback error={error} retry={retry} />
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-red-600 mb-4">Failed to load component</p>
          <button 
            onClick={retry}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      )
    }

    return (
      <Suspense fallback={delay > 0 ? <DelayedFallback delay={delay} fallback={fallback} /> : fallback}>
        <ErrorBoundary onError={handleError}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    )
  }
}

/**
 * Delayed Fallback Component
 */
function DelayedFallback({ delay, fallback }: { delay: number; fallback: ReactNode }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return show ? <>{fallback}</> : null
}

/**
 * Simple Error Boundary for Lazy Components
 */
interface ErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return null // Let parent handle error display
    }

    return this.props.children
  }
}

/**
 * Next.js Dynamic Component Wrapper with SSR Control
 */
interface DynamicComponentOptions {
  ssr?: boolean
  loading?: ComponentType
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
}

export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicComponentOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    ssr = false,
    loading: LoadingComponent
  } = options

  return dynamic(importFn, {
    ssr,
    loading: LoadingComponent ? () => <LoadingComponent /> : () => (
      <LoadingSpinner variant="lotus" label="Loading..." />
    )
  })
}

/**
 * Image Optimization Component
 */
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  lazy?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  lazy = true,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

/**
 * Virtual Scrolling Hook for Large Lists
 */
interface UseVirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleItemsCount + overscan * 2
  )

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    style: {
      position: 'absolute' as const,
      top: (startIndex + index) * itemHeight,
      height: itemHeight,
      width: '100%'
    }
  }))

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerProps: {
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll
    }
  }
}

/**
 * Performance Monitoring Hook
 */
interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])

  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      setMetrics(prev => [
        ...prev.slice(-9), // Keep last 10 measurements
        {
          renderTime,
          componentName,
          timestamp: Date.now()
        }
      ])

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
    }
  })

  const averageRenderTime = metrics.length > 0
    ? metrics.reduce((acc, metric) => acc + metric.renderTime, 0) / metrics.length
    : 0

  return {
    metrics,
    averageRenderTime,
    latestRenderTime: metrics[metrics.length - 1]?.renderTime || 0
  }
}

/**
 * Memoization Utilities
 */
export function createMemoizedComponent<P extends Record<string, any>>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, propsAreEqual)
}

/**
 * Bundle Size Analyzer (Development Only)
 */
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('📦 Bundle Analysis:', {
          transferSize: (entry as PerformanceNavigationTiming).transferSize,
          encodedBodySize: (entry as PerformanceNavigationTiming).encodedBodySize,
          decodedBodySize: (entry as PerformanceNavigationTiming).decodedBodySize
        })
      }
    }
  })

  observer.observe({ entryTypes: ['navigation'] })
}
