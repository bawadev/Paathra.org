export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone?: string
          role: 'donor' | 'monastery_admin' | 'super_admin'
          created_at: string
          updated_at: string
          is_email_verified: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string
          role?: 'donor' | 'monastery_admin' | 'super_admin'
        }
        Update: {
          full_name?: string
          phone?: string
          role?: 'donor' | 'monastery_admin' | 'super_admin'
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
        }
        Update: {
          name?: string
          address?: string
          description?: string
          phone?: string
          email?: string
          website?: string
          image_url?: string
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
    }
  }
}

export type Tables = Database['public']['Tables']

export type UserProfile = Tables['user_profiles']['Row']
export type Monastery = Tables['monasteries']['Row']
export type DonationSlot = Tables['donation_slots']['Row']
export type DonationBooking = Tables['donation_bookings']['Row']
export type BookingConfirmation = Tables['booking_confirmations']['Row']

export type UserRole = 'donor' | 'monastery_admin' | 'super_admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'