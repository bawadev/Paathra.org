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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)

          // Handle specific refresh token errors
          if (error.message.toLowerCase().includes('invalid refresh token') ||
              error.message.toLowerCase().includes('refresh token not found')) {
            console.log('Refresh token error detected, clearing session')
            await supabase.auth.signOut()
            setError('Your session has expired. Please sign in again.')
          } else if (error.message.includes('refresh') || error.message.includes('token')) {
            // Clear invalid session
            await supabase.auth.signOut()
            setError('Your session has expired. Please sign in again.')
          } else {
            setError('Authentication error. Please try again.')
          }

          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Unexpected auth error:', err)
        if (mounted) {
          setError('Authentication system error. Please refresh and try again.')
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
            clearError()
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              await fetchProfile(session.user.id)
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
            break

          case 'USER_UPDATED':
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              await fetchProfile(session.user.id)
            }
            break

          default:
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              await fetchProfile(session.user.id)
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