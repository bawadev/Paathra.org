'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DonationSlot, DonationBooking } from '@/lib/types/database.types'
import { donationSlotService, donationBookingService } from '@/lib/services/api'

interface DonationState {
  // Data
  slots: DonationSlot[]
  myBookings: DonationBooking[]
  currentSlot: DonationSlot | null

  // UI State
  loading: boolean
  error: string | null
  selectedDate: Date | null
  bookingInProgress: boolean

  // Actions
  setSlots: (slots: DonationSlot[]) => void
  setMyBookings: (bookings: DonationBooking[]) => void
  setCurrentSlot: (slot: DonationSlot | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedDate: (date: Date | null) => void
  setBookingInProgress: (inProgress: boolean) => void

  // Async Actions
  fetchAvailableSlots: () => Promise<void>
  fetchSlotsByMonastery: (monasteryId: string) => Promise<void>
  fetchMyBookings: (userId: string) => Promise<void>
  createBooking: (bookingData: any) => Promise<boolean>
  cancelBooking: (bookingId: string) => Promise<boolean>

  // Computed
  availableSlotsForDate: (date: Date) => DonationSlot[]
  upcomingBookings: () => DonationBooking[]
  pastBookings: () => DonationBooking[]
}

export const useDonationStore = create<DonationState>()(
  devtools(
    (set, get) => ({
      // Initial State
      slots: [],
      myBookings: [],
      currentSlot: null,
      loading: false,
      error: null,
      selectedDate: null,
      bookingInProgress: false,

      // Basic Actions
      setSlots: (slots) => set({ slots }),
      setMyBookings: (bookings) => set({ myBookings: bookings }),
      setCurrentSlot: (slot) => set({ currentSlot: slot }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setBookingInProgress: (inProgress) => set({ bookingInProgress: inProgress }),

      // Async Actions
      fetchAvailableSlots: async () => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await donationSlotService.getAvailable()

          if (error) {
            throw new Error(error)
          }

          set({ slots: data || [], loading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch donation slots',
            loading: false
          })
        }
      },

      fetchSlotsByMonastery: async (monasteryId: string) => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await donationSlotService.getByMonasteryId(monasteryId)

          if (error) {
            throw new Error(error)
          }

          set({ slots: data || [], loading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch monastery slots',
            loading: false
          })
        }
      },

      fetchMyBookings: async (userId: string) => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await donationBookingService.getByDonorId(userId)

          if (error) {
            throw new Error(error)
          }

          set({ myBookings: data || [], loading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch your bookings',
            loading: false
          })
        }
      },

      createBooking: async (bookingData: any) => {
        set({ bookingInProgress: true, error: null })

        try {
          const { data, error } = await donationBookingService.create(bookingData)

          if (error) {
            throw new Error(error)
          }

          // Add new booking to the list
          set((state) => ({
            myBookings: [data!, ...state.myBookings],
            bookingInProgress: false
          }))

          return true
        } catch (error: any) {
          set({
            error: error.message || 'Failed to create booking',
            bookingInProgress: false
          })
          return false
        }
      },

      cancelBooking: async (bookingId: string) => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await donationBookingService.cancel(bookingId)

          if (error) {
            throw new Error(error)
          }

          // Update booking status in the list
          set((state) => ({
            myBookings: state.myBookings.map((booking) =>
              booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
            ),
            loading: false
          }))

          return true
        } catch (error: any) {
          set({
            error: error.message || 'Failed to cancel booking',
            loading: false
          })
          return false
        }
      },

      // Computed Properties
      availableSlotsForDate: (date: Date) => {
        const { slots } = get()
        const dateStr = date.toISOString().split('T')[0]

        return slots.filter(
          (slot) =>
            slot.date === dateStr &&
            slot.is_available &&
            slot.current_bookings < slot.max_donors
        )
      },

      upcomingBookings: () => {
        const { myBookings } = get()
        const now = new Date()

        return myBookings
          .filter((booking) => {
            const bookingDate = new Date(booking.booking_date)
            return bookingDate >= now && booking.status !== 'cancelled'
          })
          .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
      },

      pastBookings: () => {
        const { myBookings } = get()
        const now = new Date()

        return myBookings
          .filter((booking) => {
            const bookingDate = new Date(booking.booking_date)
            return bookingDate < now
          })
          .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())
      },
    }),
    {
      name: 'donation-storage',
    }
  )
)