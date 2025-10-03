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
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {

          // Handle specific refresh token errors gracefully
          if (error.message.toLowerCase().includes('invalid refresh token') ||
              error.message.toLowerCase().includes('refresh token not found')) {
            await supabase.auth.signOut()
          } else if (error.message.includes('refresh') || error.message.includes('token')) {
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
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            // Fetch profile without blocking the UI
            fetchProfile(session.user.id).catch(() => {
              // Don't set loading to false here - let fetchProfile handle it
            })
          } else {
            setLoading(false)
          }
        }
      } catch (err) {
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
      if (!mounted) return

      try {
        switch (event) {
          case 'SIGNED_IN':
            clearError()
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch(() => {})
            }
            break

          case 'SIGNED_OUT':
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            clearError()
            break

          case 'TOKEN_REFRESHED':
            clearError()
            setSession(session)
            setUser(session?.user ?? null)
            // Don't fetch profile on token refresh to avoid unnecessary requests
            break

          case 'USER_UPDATED':
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch(() => {})
            }
            break

          case 'INITIAL_SESSION':
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch(() => {})
            } else {
              setProfile(null)
              setLoading(false)
            }
            break

          default:
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id).catch(() => {})
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