export * from './database.types'

export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface QueryOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  retry?: number
  refetchOnWindowFocus?: boolean
}

export interface ErrorContext {
  component: string
  action: string
  [key: string]: any
}

export interface LoadingState {
  isLoading: boolean
  isSubmitting: boolean
  message?: string
}

export interface FormFieldConfig {
  name: string
  label: string
  type: string
  required: boolean
  validation?: any
}

export interface MapLocation {
  latitude: number
  longitude: number
  address?: string
  name?: string
}