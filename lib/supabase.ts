import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Function to get Supabase client safely
export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client - only initialize if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client for middleware and server components
export const createSupabaseServerClient = (request: NextRequest, response: NextResponse) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
export * from './types'

// Import specific types
import type { MonasteryWithDistance } from './types/database.types'

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
  
  let query = client
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
      .map(monastery => ({
        ...monastery,
        distance: monastery.latitude && monastery.longitude 
          ? calculateDistance(userLat, userLon, monastery.latitude, monastery.longitude)
          : undefined
      }))
      .filter(m => !m.distance || m.distance <= maxDistance)
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    
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
    .map(monastery => ({
      ...monastery,
      distance: calculateDistance(centerLat, centerLon, monastery.latitude!, monastery.longitude!)
    }))
    .filter(m => m.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
