'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Monastery, MonasteryWithDistance } from '@/lib/types/database.types'
import { monasteryService } from '@/lib/services/api'

interface MonasteryFilters {
  search: string
  maxDistance: number
  sortBy: 'distance' | 'name' | 'monk_count'
  dietaryRequirements: string[]
  showOnlyActive: boolean
}

interface MonasteryState {
  // Data
  monasteries: MonasteryWithDistance[]
  currentMonastery: Monastery | null
  userLocation: { lat: number; lng: number } | null

  // UI State
  loading: boolean
  error: string | null
  filters: MonasteryFilters

  // Actions
  setMonasteries: (monasteries: MonasteryWithDistance[]) => void
  setCurrentMonastery: (monastery: Monastery | null) => void
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateFilters: (filters: Partial<MonasteryFilters>) => void
  resetFilters: () => void

  // Async Actions
  fetchMonasteries: () => Promise<void>
  fetchMonasteryById: (id: string) => Promise<void>
  searchMonasteries: (query: string) => void
  filterByDistance: (maxDistance: number) => void

  // Computed
  filteredMonasteries: () => MonasteryWithDistance[]
  nearbyMonasteries: () => MonasteryWithDistance[]
}

const defaultFilters: MonasteryFilters = {
  search: '',
  maxDistance: 100, // km
  sortBy: 'distance',
  dietaryRequirements: [],
  showOnlyActive: true,
}

export const useMonasteryStore = create<MonasteryState>()(
  devtools(
    (set, get) => ({
      // Initial State
      monasteries: [],
      currentMonastery: null,
      userLocation: null,
      loading: false,
      error: null,
      filters: defaultFilters,

      // Basic Actions
      setMonasteries: (monasteries) => set({ monasteries }),
      setCurrentMonastery: (monastery) => set({ currentMonastery: monastery }),
      setUserLocation: (location) => set({ userLocation: location }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      // Async Actions
      fetchMonasteries: async () => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await monasteryService.getAll()

          if (error) {
            throw new Error(error)
          }

          // Calculate distances if user location is available
          const { userLocation } = get()
          let monasteries = data || []

          if (userLocation) {
            monasteries = monasteries.map((monastery) => {
              if (monastery.latitude && monastery.longitude) {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  monastery.latitude,
                  monastery.longitude
                )
                return { ...monastery, distance }
              }
              return monastery
            })
          }

          set({ monasteries, loading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch monasteries',
            loading: false
          })
        }
      },

      fetchMonasteryById: async (id: string) => {
        set({ loading: true, error: null })

        try {
          const { data, error } = await monasteryService.getById(id)

          if (error) {
            throw new Error(error)
          }

          set({ currentMonastery: data, loading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch monastery',
            loading: false
          })
        }
      },

      searchMonasteries: (query: string) => {
        set((state) => ({
          filters: { ...state.filters, search: query }
        }))
      },

      filterByDistance: (maxDistance: number) => {
        set((state) => ({
          filters: { ...state.filters, maxDistance }
        }))
      },

      // Computed Properties
      filteredMonasteries: () => {
        const { monasteries, filters } = get()
        let filtered = [...monasteries]

        // Filter by search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (monastery) =>
              monastery.name.toLowerCase().includes(searchLower) ||
              monastery.address.toLowerCase().includes(searchLower) ||
              monastery.description?.toLowerCase().includes(searchLower)
          )
        }

        // Filter by distance
        if (filters.maxDistance && get().userLocation) {
          filtered = filtered.filter(
            (monastery) =>
              !monastery.distance || monastery.distance <= filters.maxDistance
          )
        }

        // Filter by active status
        if (filters.showOnlyActive) {
          filtered = filtered.filter((monastery) => monastery.is_active !== false)
        }

        // Sort
        filtered.sort((a, b) => {
          switch (filters.sortBy) {
            case 'distance':
              if (a.distance === undefined) return 1
              if (b.distance === undefined) return -1
              return a.distance - b.distance

            case 'name':
              return a.name.localeCompare(b.name)

            case 'monk_count':
              return (b.monk_count || 0) - (a.monk_count || 0)

            default:
              return 0
          }
        })

        return filtered
      },

      nearbyMonasteries: () => {
        const { userLocation } = get()
        if (!userLocation) return []

        return get()
          .filteredMonasteries()
          .filter((monastery) => monastery.distance && monastery.distance <= 25)
          .slice(0, 5)
      },
    }),
    {
      name: 'monastery-storage',
    }
  )
)

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}