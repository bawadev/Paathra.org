'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/types/database.types'

interface AuthState {
  // State
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  signIn: (email: string, password: string) => Promise<any>
  signInWithSocial: (provider: 'google' | 'facebook' | 'twitter') => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial State
      user: null,
      profile: null,
      session: null,
      loading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, session: null, error: null })
      },

      fetchProfile: async (userId: string) => {
        set({ loading: true, error: null })

        try {
          // Simple approach without timeout for now - let Supabase handle its own timeouts
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) {
            // Handle specific error cases
            if (error.code === 'PGRST116') {
              // Profile not found - this is expected for new users
              console.log('Profile not found for user:', userId, '- this is normal for new users')
              set({ profile: null, loading: false, error: null })
              return
            }

            // For other errors, log them but don't show to user
            console.warn('Profile fetch error:', error.message, error.code)
            set({ profile: null, loading: false, error: null })
            return
          }

          // Successfully got profile data
          set({ profile: data || null, loading: false, error: null })
        } catch (error: any) {
          // Catch any network or other errors
          console.warn('Profile fetch exception:', error.name, error.message)

          // Don't show errors to users for profile fetching - just set profile to null
          set({ profile: null, loading: false, error: null })
        }
      },

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          set({ error: error.message })
        } else {
          set({ error: null })
        }
        return { data, error }
      },

      signInWithSocial: async (provider: 'google' | 'facebook' | 'twitter') => {
        // Get current locale from the URL path
        const currentPath = window.location.pathname
        const locale = currentPath.split('/')[1] || 'en' // Default to 'en' if no locale found

        // Store locale in localStorage so we can redirect properly after auth
        localStorage.setItem('auth_redirect_locale', locale)

        console.log('OAuth starting for provider:', provider)
        console.log('Current path:', currentPath)
        console.log('Detected locale:', locale)

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          // Don't set custom redirectTo - let Supabase handle the callback
          // We'll handle the locale redirect in the callback route
        })

        console.log('OAuth response:', { data, error })

        if (error) {
          console.error('OAuth error:', error)
          set({ error: error.message })
        } else {
          set({ error: null })
        }
        return { data, error }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) {
          set({ error: error.message })
        } else {
          set({ error: null })
        }
        return { data, error }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user } = get()
        if (!user) return

        try {
          const { error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)

          if (!error) {
            set((state) => ({
              profile: state.profile ? { ...state.profile, ...updates } : null
            }))
          } else {
            throw error
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to update profile' })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)