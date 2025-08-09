export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone?: string
          avatar_url?: string
          address?: string
          user_types: ('donor' | 'monastery_admin' | 'super_admin')[]
          created_at: string
          updated_at: string
          is_email_verified: boolean
          latitude?: number
          longitude?: number
          location_permission?: boolean
          location_updated_at?: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string
          avatar_url?: string
          address?: string
          user_types?: ('donor' | 'monastery_admin' | 'super_admin')[]
        }
        Update: {
          full_name?: string
          phone?: string
          avatar_url?: string
          address?: string
          user_types?: ('donor' | 'monastery_admin' | 'super_admin')[]
          updated_at?: string
        }
      }
      monasteries: {
        Row: {
          id: string
          name: string
          description?: string
          address: string
          phone?: string
          email?: string
          website?: string
          admin_id?: string
          image_url?: string
          avatar_url?: string
          capacity?: number
          dietary_requirements?: string[]
          preferred_donation_times?: string
          created_at: string
          updated_at: string
          is_active?: boolean
          status?: string
          latitude?: number
          longitude?: number
          location_verified?: boolean
          location_updated_at?: string
          confirmation_days_config?: any
          representative_name?: string
          representative_phone?: string
          representative_email?: string
          breakfast_time?: string
          lunch_time?: string
          dinner_time?: string
          // Portfolio fields
          portfolio_description?: string
          background_image_url?: string
          gallery_images?: string[]
          established_year?: number
          tradition?: string
          monk_count?: number
          daily_schedule?: {
            morning?: string
            afternoon?: string
            evening?: string
          }
          facilities?: string[]
          rules_guidelines?: string
          contact_person_name?: string
          contact_person_role?: string
          social_media?: {
            facebook?: string
            twitter?: string
            instagram?: string
          }
          special_requirements?: string
        }
        Insert: {
          name: string
          address: string
          description?: string
          phone?: string
          email?: string
          website?: string
          admin_id?: string
          image_url?: string
          avatar_url?: string
          capacity?: number
          dietary_requirements?: string[]
          preferred_donation_times?: string
          is_active?: boolean
          status?: string
          latitude?: number
          longitude?: number
          location_verified?: boolean
          location_updated_at?: string
          confirmation_days_config?: any
          representative_name?: string
          representative_phone?: string
          representative_email?: string
          breakfast_time?: string
          lunch_time?: string
          dinner_time?: string
          // Portfolio fields
          portfolio_description?: string
          background_image_url?: string
          gallery_images?: string[]
          established_year?: number
          tradition?: string
          monk_count?: number
          daily_schedule?: any
          facilities?: string[]
          rules_guidelines?: string
          contact_person_name?: string
          contact_person_role?: string
          social_media?: any
          special_requirements?: string
        }
        Update: {
          name?: string
          address?: string
          description?: string
          phone?: string
          email?: string
          website?: string
          image_url?: string
          avatar_url?: string
          capacity?: number
          dietary_requirements?: string[]
          preferred_donation_times?: string
          is_active?: boolean
          status?: string
          latitude?: number
          longitude?: number
          location_verified?: boolean
          location_updated_at?: string
          confirmation_days_config?: any
          representative_name?: string
          representative_phone?: string
          representative_email?: string
          breakfast_time?: string
          lunch_time?: string
          dinner_time?: string
          updated_at?: string
          // Portfolio fields
          portfolio_description?: string
          background_image_url?: string
          gallery_images?: string[]
          established_year?: number
          tradition?: string
          monk_count?: number
          daily_schedule?: any
          facilities?: string[]
          rules_guidelines?: string
          contact_person_name?: string
          contact_person_role?: string
          social_media?: any
          special_requirements?: string
        }
      }
      donation_slots: {
        Row: {
          id: string
          monastery_id: string
          date: string
          time_slot: string
          max_donors: number
          current_bookings: number
          is_available: boolean
          special_requirements?: string
          booking_notes?: string
          meal_type?: string
          monks_capacity: number
          monks_fed: number
          created_by?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          monastery_id: string
          date: string
          time_slot: string
          max_donors?: number
          current_bookings?: number
          is_available?: boolean
          special_requirements?: string
          booking_notes?: string
          meal_type?: string
          monks_capacity?: number
          monks_fed?: number
          created_by?: string
        }
        Update: {
          max_donors?: number
          current_bookings?: number
          is_available?: boolean
          special_requirements?: string
          booking_notes?: string
          meal_type?: string
          monks_capacity?: number
          monks_fed?: number
          updated_at?: string
        }
      }
      donation_bookings: {
        Row: {
          id: string
          user_id: string
          slot_id: string
          monastery_id: string
          food_type: string
          quantity: string
          special_instructions?: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          slot_id: string
          monastery_id: string
          food_type: string
          quantity: string
          special_instructions?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
        }
        Update: {
          food_type?: string
          quantity?: string
          special_instructions?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          updated_at?: string
        }
      }
      booking_confirmations: {
        Row: {
          id: string
          booking_id: string
          confirmed_by: string
          notes?: string
          created_at: string
        }
        Insert: {
          booking_id: string
          confirmed_by: string
          notes?: string
        }
      }
      guest_profiles: {
        Row: {
          id: string
          phone: string
          full_name: string
          email?: string
          address?: string
          notes?: string
          monastery_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          phone: string
          full_name: string
          email?: string
          address?: string
          notes?: string
          monastery_id: string
        }
        Update: {
          phone?: string
          full_name?: string
          email?: string
          address?: string
          notes?: string
          updated_at?: string
        }
      }
      guest_bookings: {
        Row: {
          id: string
          donation_slot_id: string
          guest_profile_id: string
          food_type: string
          estimated_servings: number
          special_notes?: string
          contact_phone: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          confirmed_at?: string
          delivered_at?: string
        }
        Insert: {
          donation_slot_id: string
          guest_profile_id: string
          food_type: string
          estimated_servings: number
          special_notes?: string
          contact_phone: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
        }
        Update: {
          food_type?: string
          estimated_servings?: number
          special_notes?: string
          contact_phone?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          updated_at?: string
          confirmed_at?: string
          delivered_at?: string
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type UserProfile = Tables['user_profiles']['Row']
export type Monastery = Tables['monasteries']['Row']
export type DonationSlot = Tables['donation_slots']['Row']
export type DonationBooking = Tables['donation_bookings']['Row']
export type BookingConfirmation = Tables['booking_confirmations']['Row']
export type GuestProfile = Tables['guest_profiles']['Row']
export type GuestBooking = Tables['guest_bookings']['Row']

export type UserRole = 'donor' | 'monastery_admin' | 'super_admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// Extended types for location-based functionality
export type MonasteryWithDistance = Monastery & {
  distance?: number
}