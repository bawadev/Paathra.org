import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client for middleware and server components
export const createSupabaseServerClient = (request: NextRequest, response: NextResponse) => {
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
  let query = supabase
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
  const { error } = await supabase
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
  const { error } = await supabase
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
  const { data, error } = await supabase
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
