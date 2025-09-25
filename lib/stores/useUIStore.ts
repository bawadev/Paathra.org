'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Loading states
  isLoading: boolean
  loadingMessage: string | null

  // Modal states
  activeModal: string | null
  modalData: any

  // Notification states
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    autoHide?: boolean
  }>

  // Navigation states
  sidebarOpen: boolean
  mobileMenuOpen: boolean

  // Theme states
  theme: 'light' | 'dark' | 'system'

  // Actions
  setLoading: (loading: boolean, message?: string) => void
  openModal: (modalId: string, data?: any) => void
  closeModal: () => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

let notificationCounter = 0

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial State
      isLoading: false,
      loadingMessage: null,
      activeModal: null,
      modalData: null,
      notifications: [],
      sidebarOpen: false,
      mobileMenuOpen: false,
      theme: 'system',

      // Actions
      setLoading: (loading, message = null) =>
        set({ isLoading: loading, loadingMessage: message }),

      openModal: (modalId, data = null) =>
        set({ activeModal: modalId, modalData: data }),

      closeModal: () =>
        set({ activeModal: null, modalData: null }),

      addNotification: (notification) => {
        const id = `notification-${++notificationCounter}`
        const newNotification = { ...notification, id }

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove after 5 seconds if autoHide is not explicitly false
        if (notification.autoHide !== false) {
          setTimeout(() => {
            get().removeNotification(id)
          }, 5000)
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      clearNotifications: () =>
        set({ notifications: [] }),

      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),

      setMobileMenuOpen: (open) =>
        set({ mobileMenuOpen: open }),

      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement

          if (theme === 'dark') {
            root.classList.add('dark')
          } else if (theme === 'light') {
            root.classList.remove('dark')
          } else {
            // System theme
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (systemDark) {
              root.classList.add('dark')
            } else {
              root.classList.remove('dark')
            }
          }
        }
      },
    }),
    {
      name: 'ui-storage',
    }
  )
)