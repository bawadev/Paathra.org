'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse, PaginatedResponse, Monastery, DonationSlot, DonationBooking } from '@/lib/types'

// Generic hook for API calls
export function useApiCall<T>(
  url: string | null,
  options: RequestInit = {},
  dependencies: any[] = []
): ApiResponse<T> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!url) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      setData(result.data || result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [url, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  }
}

// Hook for paginated data
export function usePaginatedApi<T>(
  baseUrl: string,
  searchParams: Record<string, string> = {},
  initialPage = 1,
  initialLimit = 10
) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [params, setParams] = useState(searchParams)

  const url = baseUrl ? (() => {
    const urlObj = new URL(baseUrl, window.location.origin)
    urlObj.searchParams.set('page', page.toString())
    urlObj.searchParams.set('limit', limit.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value)
      }
    })
    
    return urlObj.toString()
  })() : null

  const { data: response, error, loading, refetch } = useApiCall<{
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }>(url)

  const data = response?.data || []
  const pagination = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  }

  const nextPage = () => {
    if (pagination.hasNextPage) {
      setPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (pagination.hasPreviousPage) {
      setPage(prev => prev - 1)
    }
  }

  const updateParams = (newParams: Record<string, string>) => {
    setParams(prev => ({ ...prev, ...newParams }))
    setPage(1) // Reset to first page when parameters change
  }

  return {
    data,
    ...pagination,
    loading,
    error,
    refetch,
    nextPage,
    previousPage,
    setPage,
    setLimit,
    updateParams,
  }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<TData, TPayload>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (payload?: TPayload): Promise<TData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      return result.data || result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    mutate,
    loading,
    error,
  }
}

// Specialized hooks for specific resources
export function useMonasteries(searchParams: Record<string, string> = {}) {
  return usePaginatedApi<Monastery>('/api/monasteries', searchParams)
}

export function useDonationSlots(searchParams: Record<string, string> = {}) {
  return usePaginatedApi<DonationSlot>('/api/donation-slots', searchParams)
}

export function useBookings(searchParams: Record<string, string> = {}) {
  return usePaginatedApi<DonationBooking>('/api/bookings', searchParams)
}

export function useCreateMonastery() {
  return useMutation<Monastery, any>('/api/monasteries', 'POST')
}

export function useCreateDonationSlot() {
  return useMutation<DonationSlot, any>('/api/donation-slots', 'POST')
}

export function useCreateBooking() {
  return useMutation<DonationBooking, any>('/api/bookings', 'POST')
}
