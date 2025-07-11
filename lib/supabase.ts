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

// Types for our database
export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  user_type: 'donor' | 'monastery_admin' | 'super_admin'
  avatar_url?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Monastery {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  email?: string
  website?: string
  admin_id?: string
  image_url?: string
  capacity: number
  dietary_requirements: string[]
  preferred_donation_times?: string
  created_at: string
  updated_at: string
}

export interface DonationSlot {
  id: string
  monastery_id: string
  date: string
  time_slot: string
  max_donors: number
  current_bookings: number
  special_requirements?: string
  is_available: boolean
  created_by?: string
  created_at: string
  updated_at: string
  monastery?: Monastery
}

export interface DonationBooking {
  id: string
  donation_slot_id: string
  donor_id: string
  food_type: string
  estimated_servings: number
  special_notes?: string
  contact_phone?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  confirmed_at?: string
  created_at: string
  updated_at: string
  donation_slot?: DonationSlot
  donor?: UserProfile
}
