import { useState, useEffect, useCallback } from 'react'
import { 
  monasteryService, 
  donationSlotService, 
  donationBookingService, 
  userService,
  type ApiResponse 
} from '@/lib/services/api'
import type { 
  Monastery, 
  DonationSlot, 
  DonationBooking, 
  UserProfile 
} from '@/lib/supabase'

// Generic hook for async operations
export function useAsync<T>(
  asyncFunction: () => Promise<ApiResponse<T>>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      
      if (result.error) {
        setError(result.error)
        setData(null)
      } else {
        setData(result.data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// Monasteries hooks
export function useMonasteries() {
  return useAsync(() => monasteryService.getAll())
}

export function useMonastery(id: string | null) {
  return useAsync(
    () => id ? monasteryService.getById(id) : Promise.resolve({ data: null, error: null }),
    [id]
  )
}

export function useMonasteryByAdmin(adminId: string | null) {
  return useAsync(
    () => adminId ? monasteryService.getByAdminId(adminId) : Promise.resolve({ data: null, error: null }),
    [adminId]
  )
}

// Donation slots hooks
export function useDonationSlots() {
  return useAsync(() => donationSlotService.getAvailable())
}

export function useMonasterySlots(monasteryId: string | null) {
  return useAsync(
    () => monasteryId ? donationSlotService.getByMonasteryId(monasteryId) : Promise.resolve({ data: [], error: null }),
    [monasteryId]
  )
}

// Donation bookings hooks
export function useDonorBookings(donorId: string | null) {
  return useAsync(
    () => donorId ? donationBookingService.getByDonorId(donorId) : Promise.resolve({ data: [], error: null }),
    [donorId]
  )
}

export function useMonasteryBookings(monasteryId: string | null) {
  return useAsync(
    () => monasteryId ? donationBookingService.getByMonasteryId(monasteryId) : Promise.resolve({ data: [], error: null }),
    [monasteryId]
  )
}

// User profile hook
export function useUserProfile(userId: string | null) {
  return useAsync(
    () => userId ? userService.getProfile(userId) : Promise.resolve({ data: null, error: null }),
    [userId]
  )
}

// Mutation hooks for creating/updating data
export function useAsyncMutation<TInput, TOutput>(
  asyncFunction: (input: TInput) => Promise<ApiResponse<TOutput>>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (input: TInput): Promise<TOutput | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await asyncFunction(input)
      
      if (result.error) {
        setError(result.error)
        return null
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  return { mutate, loading, error, setError }
}

// Specific mutation hooks
export function useCreateDonationBooking() {
  return useAsyncMutation(donationBookingService.create)
}

export function useCreateMonastery() {
  return useAsyncMutation(monasteryService.create)
}

export function useCreateDonationSlot() {
  return useAsyncMutation(donationSlotService.create)
}

export function useCreateBulkDonationSlots() {
  return useAsyncMutation(donationSlotService.createBulk)
}

export function useUpdateUserProfile() {
  return useAsyncMutation(({ userId, updates }: { userId: string, updates: Parameters<typeof userService.updateProfile>[1] }) =>
    userService.updateProfile(userId, updates)
  )
}

export function useCancelBooking() {
  return useAsyncMutation((bookingId: string) => donationBookingService.cancel(bookingId))
}
