'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/stores/useAuthStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    setUser,
    setProfile,
    setSession,
    setLoading,
    setError,
    clearError,
    fetchProfile,
  } = useAuthStore()

  useEffect(() => {
    let mounted = true
    let isInitializing = false

    // Get initial session
    const getInitialSession = async () => {
      if (isInitializing) return
      isInitializing = true

      try {
        console.log('Initializing auth session...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.warn('Error getting session:', error.message)

          // Handle specific refresh token errors gracefully
          if (error.message.toLowerCase().includes('invalid refresh token') ||
              error.message.toLowerCase().includes('refresh token not found')) {
            console.log('Invalid refresh token detected, clearing session')
            await supabase.auth.signOut()
          } else if (error.message.includes('refresh') || error.message.includes('token')) {
            console.log('Token error detected, clearing session')
            await supabase.auth.signOut()
          }

          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            // Don't set error for common token issues - just clear state
            setError(null)
          }
          return
        }

        if (mounted) {
          console.log('Session status:', session ? 'authenticated' : 'not authenticated')
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            // Fetch profile without blocking the UI
            fetchProfile(session.user.id).catch((err) => {
              console.warn('Profile fetch failed during initialization:', err)
              // Don't set loading to false here - let fetchProfile handle it
            })
          } else {
            setLoading(false)
          }
        }
      } catch (err) {
        console.warn('Unexpected auth initialization error:', err)
        if (mounted) {
          // Don't show errors to users during initialization
          setError(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)

      if (!mounted) return

      try {
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in')
            clearError()
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch((err) => {
                console.warn('Profile fetch failed after sign in:', err)
              })
            }
            break

          case 'SIGNED_OUT':
            console.log('User signed out')
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            clearError()
            break

          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            clearError()
            setSession(session)
            setUser(session?.user ?? null)
            // Don't fetch profile on token refresh to avoid unnecessary requests
            break

          case 'USER_UPDATED':
            console.log('User updated')
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch((err) => {
                console.warn('Profile fetch failed after user update:', err)
              })
            }
            break

          case 'INITIAL_SESSION':
            console.log('Initial session loaded')
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch((err) => {
                console.warn('Profile fetch failed for initial session:', err)
              })
            } else {
              setProfile(null)
              setLoading(false)
            }
            break

          default:
            console.log('Auth state change:', event)
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch((err) => {
                console.warn('Profile fetch failed for auth event:', event, err)
              })
            } else {
              setProfile(null)
              setLoading(false)
            }
        }
      } catch (err: any) {
        console.error('Error handling auth state change:', err)

        // Handle refresh token errors specifically
        if (err?.message?.toLowerCase().includes('invalid refresh token') ||
            err?.message?.toLowerCase().includes('refresh token not found')) {
          console.log('Refresh token error in auth state change, clearing session')
          await supabase.auth.signOut()
          setError('Your session has expired. Please sign in again.')
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          setError('Authentication error occurred. Please refresh the page.')
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setSession, setLoading, setError, clearError, fetchProfile])

  return <>{children}</>
}