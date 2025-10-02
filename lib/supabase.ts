import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseConfig } from './env'

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Client-side Supabase client - always return a client (real or mock)
export const supabase = (() => {
  if (supabaseConfig.url && supabaseConfig.anonKey && isValidUrl(supabaseConfig.url)) {
    console.log('✅ Supabase client initialized with:', {
      url: supabaseConfig.url.substring(0, 30) + '...',
      keyLength: supabaseConfig.anonKey.length
    })
    return createClient(supabaseConfig.url, supabaseConfig.anonKey)
  }

  // Return mock client to prevent null errors
  console.error('🚨 SUPABASE MOCK CLIENT ACTIVE - NO DATA WILL BE FETCHED!')
  console.error('Issue details:', {
    url: supabaseConfig.url || 'Missing',
    urlValid: supabaseConfig.url ? isValidUrl(supabaseConfig.url) : false,
    anonKeyLength: supabaseConfig.anonKey?.length || 0,
  })
  console.warn('⚠️ Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      eq: function() { return this },
      not: function() { return this },
      order: function() { return this },
    }),
  } as any
})()

// Function to get Supabase client safely - returns singleton instance
export const getSupabaseClient = () => {
  return supabase
}

// Server-side Supabase client for middleware and server components
export const createSupabaseServerClient = (request: NextRequest, response: NextResponse) => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey || !isValidUrl(supabaseConfig.url)) {
    console.warn('Missing or invalid Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    // Return a mock server client instead of throwing
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        eq: function() { return this },
        not: function() { return this },
        order: function() { return this },
      }),
    } as any
  }
  
  return createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

// Re-export types from centralized location
export * from './types/'

// Import specific types
import type { Monastery, MonasteryWithDistance } from './types/database.types'

// Location-based functions
import { calculateDistance } from './location-utils'

/**
 * Get monasteries sorted by distance from user location
 */
export async function getMonasteriesWithDistance(
  userLat?: number, 
  userLon?: number,
  maxDistance = 100 // km
): Promise<MonasteryWithDistance[]> {
  const client = getSupabaseClient();
  
  const query = client
    .from('monasteries')
    .select('*')
    .eq('is_active', true)

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching monasteries:', error);
    return [];
  }

  if (!data) return [];

  if (userLat && userLon) {
    // Calculate distances and sort
    const monasteriesWithDistance = data
      .map((monastery: Monastery) => ({
        ...monastery,
        distance: monastery.latitude && monastery.longitude
          ? calculateDistance(userLat, userLon, monastery.latitude, monastery.longitude)
          : undefined
      }))
      .filter((m: MonasteryWithDistance) => !m.distance || m.distance <= maxDistance)
      .sort((a: MonasteryWithDistance, b: MonasteryWithDistance) => (a.distance || Infinity) - (b.distance || Infinity));
    
    return monasteriesWithDistance;
  }

  return data;
}

/**
 * Update user location in profile
 */
export async function updateUserLocation(userId: string, latitude: number, longitude: number, address?: string) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('user_profiles')
    .update({
      latitude,
      longitude,
      address
    })
    .eq('id', userId);
  
  return { error };
}

/**
 * Update monastery location
 */
export async function updateMonasteryLocation(monasteryId: string, latitude: number, longitude: number, address?: string) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('monasteries')
    .update({
      latitude,
      longitude,
      address
    })
    .eq('id', monasteryId);
  
  return { error };
}

/**
 * Get monasteries within a specific radius
 */
export async function getMonasteriesInRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number = 50
): Promise<MonasteryWithDistance[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('monasteries')
    .select('*')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error || !data) return [];

  return data
    .map((monastery: Monastery) => ({
      ...monastery,
      distance: calculateDistance(centerLat, centerLon, monastery.latitude!, monastery.longitude!)
    }))
    .filter((m: MonasteryWithDistance) => m.distance !== undefined && m.distance <= radiusKm)
    .sort((a: MonasteryWithDistance, b: MonasteryWithDistance) => (a.distance || 0) - (b.distance || 0));
}
