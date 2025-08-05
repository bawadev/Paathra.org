'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'
import { hasRole, isAdmin, isSuperAdmin, UserType } from '@/types/auth'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<any>
  signInWithSocial: (provider: 'google' | 'facebook' | 'twitter') => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            setError(null)
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
            setError(null)
            break
            
          case 'TOKEN_REFRESHED':
            setError(null)
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
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching profile:', error)
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
    } else {
      setError(null)
    }
    return { data, error }
  }

  const signInWithSocial = async (provider: 'google' | 'facebook' | 'twitter') => {
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
      setError(error.message)
    } else {
      setError(null)
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
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
      setError(error.message)
    } else {
      setError(null)
    }
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signInWithSocial,
    signUp,
    signOut,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
