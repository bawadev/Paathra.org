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
          address: string
          latitude: number
          longitude: number
          contact_person: string
          phone: string
          email: string
          dietary_requirements: string[]
          special_instructions?: string
          capacity: number
          user_id: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          name: string
          address: string
          latitude: number
          longitude: number
          contact_person: string
          phone: string
          email: string
          dietary_requirements: string[]
          special_instructions?: string
          capacity: number
          user_id: string
        }
        Update: {
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          contact_person?: string
          phone?: string
          email?: string
          dietary_requirements?: string[]
          special_instructions?: string
          capacity?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      donation_slots: {
        Row: {
          id: string
          monastery_id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          current_bookings: number
          is_available: boolean
          requirements?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          monastery_id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          is_available?: boolean
          requirements?: string
        }
        Update: {
          capacity?: number
          current_bookings?: number
          is_available?: boolean
          requirements?: string
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