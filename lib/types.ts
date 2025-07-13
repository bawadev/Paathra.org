// Core database types (should match Supabase types)
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone?: string
  address?: string
  user_types: string[]
  created_at: string
  updated_at: string
}

export interface Monastery {
  id: string
  name: string
  address: string
  contact_phone: string
  description: string
  dietary_requirements?: string
  preferred_meal_times: string[]
  admin_id: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface DonationSlot {
  id: string
  monastery_id: string
  date: string
  time_slot: string
  max_donors: number
  current_donors: number
  special_requirements?: string
  is_active: boolean
  created_at: string
  updated_at: string
  monastery?: Monastery
}

export interface DonationBooking {
  id: string
  donor_id: string
  slot_id: string
  food_type: string
  estimated_servings: number
  special_notes?: string
  contact_phone?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  donor?: UserProfile
  slot?: DonationSlot
}

// Form input types (from schemas)
export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  fullName: string
}

export interface DonationBookingInput {
  food_type: string
  estimated_servings: string
  special_notes?: string
  contact_phone?: string
}

export interface MonasteryInput {
  name: string
  address: string
  contact_phone: string
  description: string
  dietary_requirements?: string
  preferred_meal_times: string[]
}

export interface DonationSlotInput {
  date: string
  time_slot: string
  max_donors: number
  special_requirements?: string
}

export interface UserProfileInput {
  full_name: string
  phone?: string
  address?: string
  user_types: string[]
}

// Component props types
export interface NavigationProps {
  className?: string
}

export interface AuthFormProps {
  redirectTo?: string
}

export interface LoadingProps {
  className?: string
  text?: string
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Auth context types
export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfileInput>) => Promise<void>
}

// Utility types
export type UserRole = 'donor' | 'monastery_admin' | 'super_admin'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type MealTime = 
  | 'Breakfast (6:00 AM - 9:00 AM)'
  | 'Lunch (11:00 AM - 2:00 PM)'
  | 'Dinner (5:00 PM - 8:00 PM)'
  | 'Snacks (3:00 PM - 5:00 PM)'

// Error types
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

// Component state types
export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
}

export interface TableState<T> {
  data: T[]
  loading: boolean
  error: string | null
  page: number
  limit: number
  total: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters: Record<string, any>
}

// Route protection types
export interface RouteGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ComponentType
}
