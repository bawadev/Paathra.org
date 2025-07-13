import { supabase } from '@/lib/supabase'
import type { 
  DonationSlot, 
  Monastery, 
  DonationBooking, 
  UserProfile 
} from '@/lib/supabase'
import type { 
  DonationBookingInput, 
  MonasteryInput, 
  DonationSlotInput,
  UserProfileInput 
} from '@/lib/schemas'

// Base API response type
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading?: boolean
}

// Enhanced error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper function to handle Supabase responses
function handleSupabaseResponse<T>(response: { data: T | null; error: any }): ApiResponse<T> {
  if (response.error) {
    throw new ApiError(
      response.error.message || 'An unexpected error occurred',
      response.error.code,
      response.error
    )
  }
  return {
    data: response.data,
    error: null,
  }
}

// Authentication services
export const authService = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { 
        data: data.session ? data : null, 
        error: error?.message || null 
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { 
        data: data.user ? data : null, 
        error: error?.message || null 
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { data: null, error: error?.message || null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }
    }
  },

  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data: data.session, error }
  },
}

// User profile services
export const userService = {
  getProfile: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  updateProfile: async (userId: string, updates: Partial<UserProfileInput>): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  createProfile: async (profile: UserProfileInput & { id: string }): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },
}

// Monastery services
export const monasteryService = {
  getAll: async (): Promise<ApiResponse<Monastery[]>> => {
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .order('name')

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  getById: async (id: string): Promise<ApiResponse<Monastery>> => {
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .eq('id', id)
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  getByAdminId: async (adminId: string): Promise<ApiResponse<Monastery>> => {
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .eq('admin_id', adminId)
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  create: async (monastery: MonasteryInput & { admin_id: string }): Promise<ApiResponse<Monastery>> => {
    const { data, error } = await supabase
      .from('monasteries')
      .insert([monastery])
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  update: async (id: string, updates: Partial<MonasteryInput>): Promise<ApiResponse<Monastery>> => {
    const { data, error } = await supabase
      .from('monasteries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },
}

// Donation slot services
export const donationSlotService = {
  getAvailable: async (): Promise<ApiResponse<DonationSlot[]>> => {
    const { data, error } = await supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(*)
      `)
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time_slot')

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  getByMonasteryId: async (monasteryId: string): Promise<ApiResponse<DonationSlot[]>> => {
    const { data, error } = await supabase
      .from('donation_slots')
      .select('*')
      .eq('monastery_id', monasteryId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time_slot')

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  create: async (slot: DonationSlotInput & { monastery_id: string, created_by: string }): Promise<ApiResponse<DonationSlot>> => {
    const { data, error } = await supabase
      .from('donation_slots')
      .insert([slot])
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  createBulk: async (slots: Array<DonationSlotInput & { monastery_id: string, created_by: string }>): Promise<ApiResponse<DonationSlot[]>> => {
    const { data, error } = await supabase
      .from('donation_slots')
      .insert(slots)
      .select()

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('donation_slots')
      .delete()
      .eq('id', id)

    return {
      data: null,
      error: error?.message || null,
    }
  },
}

// Donation booking services
export const donationBookingService = {
  create: async (booking: DonationBookingInput & { 
    donation_slot_id: string, 
    donor_id: string 
  }): Promise<ApiResponse<DonationBooking>> => {
    const { data, error } = await supabase
      .from('donation_bookings')
      .insert([{
        ...booking,
        estimated_servings: parseInt(booking.estimated_servings),
      }])
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  getByDonorId: async (donorId: string): Promise<ApiResponse<DonationBooking[]>> => {
    const { data, error } = await supabase
      .from('donation_bookings')
      .select(`
        *,
        donation_slot:donation_slots(
          *,
          monastery:monasteries(name, address)
        )
      `)
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false })

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  getByMonasteryId: async (monasteryId: string): Promise<ApiResponse<DonationBooking[]>> => {
    const { data, error } = await supabase
      .from('donation_bookings')
      .select(`
        *,
        donation_slot:donation_slots(
          *,
          monastery:monasteries(name, address)
        ),
        donor:user_profiles(full_name, phone)
      `)
      .eq('donation_slot.monastery_id', monasteryId)
      .order('created_at', { ascending: false })

    return {
      data: data || [],
      error: error?.message || null,
    }
  },

  updateStatus: async (id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<ApiResponse<DonationBooking>> => {
    const { data, error } = await supabase
      .from('donation_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    return {
      data,
      error: error?.message || null,
    }
  },

  cancel: async (id: string): Promise<ApiResponse<DonationBooking>> => {
    return donationBookingService.updateStatus(id, 'cancelled')
  },
}
