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
          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          )

          // Create the profile fetch promise
          const fetchPromise = supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

          // Race between fetch and timeout
          const { data, error } = await Promise.race([
            fetchPromise,
            timeoutPromise
          ]) as any

          if (error && error.code !== 'PGRST116') {
            // Try fallback fetch using REST API
            try {
              const session = await supabase.auth.getSession()
              const fallbackResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
                {
                  headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    'Authorization': `Bearer ${session.data.session?.access_token}`
                  }
                }
              )

              if (fallbackResponse.ok) {
                const profiles = await fallbackResponse.json()
                if (profiles && profiles.length > 0) {
                  set({ profile: profiles[0], loading: false })
                  return
                }
              }
            } catch (fallbackError) {
              console.error('Fallback profile fetch failed:', fallbackError)
            }

            throw error
          }

          set({ profile: data || null, loading: false })
        } catch (error: any) {
          console.error('Error fetching profile:', error)
          set({
            error: error.message === 'Profile fetch timeout'
              ? 'Profile loading timed out. Please refresh the page.'
              : 'Failed to load profile',
            loading: false,
            profile: null
          })
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