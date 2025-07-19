/**
 * Enhanced Component Composition System
 * 
 * Provides compound components, custom hooks for business logic,
 * and better component abstractions for the Dhaana application.
 */

'use client'

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode, 
  ComponentPropsWithoutRef,
  forwardRef
} from 'react'
import { cn } from '@/lib/utils'

/**
 * Compound Component Pattern for Cards
 */
interface CardContextType {
  variant: 'default' | 'elevated' | 'bordered' | 'glass'
  size: 'sm' | 'md' | 'lg'
  interactive: boolean
}

const CardContext = createContext<CardContextType | null>(null)

function useCardContext() {
  const context = useContext(CardContext)
  if (!context) {
    throw new Error('Card components must be used within a Card component')
  }
  return context
}

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', size = 'md', interactive = false, className, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg border-0',
      bordered: 'bg-white border-2 border-gray-300',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20'
    }

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    const contextValue: CardContextType = { variant, size, interactive }

    return (
      <CardContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'rounded-lg transition-all duration-200',
            variantClasses[variant],
            sizeClasses[size],
            interactive && 'hover:shadow-md hover:scale-[1.02] cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCardContext()
    
    const sizeClasses = {
      sm: 'mb-3',
      md: 'mb-4',
      lg: 'mb-6'
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h3'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCardContext()
    
    const sizeClasses = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl'
    }

    return (
      <h3
        ref={ref}
        className={cn('font-semibold leading-none tracking-tight', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCardContext()
    
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    }

    return (
      <p
        ref={ref}
        className={cn('text-muted-foreground', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCardContext()
    
    const sizeClasses = {
      sm: 'mt-3 pt-3',
      md: 'mt-4 pt-4',
      lg: 'mt-6 pt-6'
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center border-t border-gray-100', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

/**
 * Form Composition Pattern
 */
interface FormContextType {
  isLoading: boolean
  errors: Record<string, string>
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
}

const FormContext = createContext<FormContextType | null>(null)

export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('Form components must be used within a FormProvider')
  }
  return context
}

interface FormProviderProps {
  children: ReactNode
  isLoading?: boolean
  onSubmit?: (data: any) => void | Promise<void>
}

export function FormProvider({ children, isLoading = false, onSubmit }: FormProviderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const contextValue: FormContextType = {
    isLoading,
    errors,
    setError,
    clearError
  }

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </FormContext.Provider>
  )
}

/**
 * Modal Composition Pattern
 */
interface ModalContextType {
  isOpen: boolean
  onClose: () => void
  size: 'sm' | 'md' | 'lg' | 'xl'
}

const ModalContext = createContext<ModalContextType | null>(null)

function useModalContext() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Modal components must be used within a Modal component')
  }
  return context
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

export function Modal({ isOpen, onClose, size = 'md', children }: ModalProps) {
  const contextValue: ModalContextType = { isOpen, onClose, size }

  if (!isOpen) return null

  return (
    <ModalContext.Provider value={contextValue}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

const ModalHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useModalContext()
    
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    return (
      <div
        ref={ref}
        className={cn('border-b border-gray-200', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ModalHeader.displayName = 'ModalHeader'

const ModalBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useModalContext()
    
    const sizeClasses = {
      sm: 'p-4 max-w-sm',
      md: 'p-6 max-w-md',
      lg: 'p-8 max-w-lg',
      xl: 'p-10 max-w-xl'
    }

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ModalBody.displayName = 'ModalBody'

const ModalFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useModalContext()
    
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-t border-gray-200 flex justify-end gap-3',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ModalFooter.displayName = 'ModalFooter'

export { ModalHeader, ModalBody, ModalFooter }

/**
 * Custom Hooks for Business Logic
 */

/**
 * Hook for managing async operations with state
 */
interface UseAsyncStateResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (operation: () => Promise<T>) => Promise<void>
  reset: () => void
}

export function useAsyncState<T>(): UseAsyncStateResult<T> {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await operation()
      setState({ data: result, loading: false, error: null })
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Hook for managing pagination state
 */
interface UsePaginationResult {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void
}

export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = 10,
  totalItems: number = 0
): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNext])

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPrevious])

  const handleSetPageSize = useCallback((newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNext,
    hasPrevious,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize
  }
}

/**
 * Hook for managing toggle state with persistence
 */
export function useToggle(
  initialValue: boolean = false,
  persistKey?: string
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(persistKey)
      return saved ? JSON.parse(saved) : initialValue
    }
    return initialValue
  })

  const toggle = useCallback(() => {
    setValue(prev => {
      const newValue = !prev
      if (persistKey && typeof window !== 'undefined') {
        localStorage.setItem(persistKey, JSON.stringify(newValue))
      }
      return newValue
    })
  }, [persistKey])

  const setToggleValue = useCallback((newValue: boolean) => {
    setValue(newValue)
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(persistKey, JSON.stringify(newValue))
    }
  }, [persistKey])

  return [value, toggle, setToggleValue]
}

/**
 * Hook for managing local storage with SSR safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
