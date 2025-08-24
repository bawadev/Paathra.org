// User types
export type UserType = 'donor' | 'monastery_admin' | 'super_admin'

// Database types
export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  user_types: UserType[]
  avatar_url?: string | undefined
  address?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

// Helper function to check if user has a specific role
export function hasRole(profile: UserProfile | null, role: UserType): boolean {
  return profile?.user_types?.includes(role) ?? false
}

// Helper function to check if user has any admin role
export function isAdmin(profile: UserProfile | null): boolean {
  return hasRole(profile, 'monastery_admin') || hasRole(profile, 'super_admin')
}

// Helper function to check if user is super admin
export function isSuperAdmin(profile: UserProfile | null): boolean {
  return hasRole(profile, 'super_admin')
}

// Helper function to get display name for user types
export function getUserTypeDisplayName(userType: UserType): string {
  switch (userType) {
    case 'donor':
      return 'Donor'
    case 'monastery_admin':
      return 'Monastery Admin'
    case 'super_admin':
      return 'Super Admin'
    default:
      return 'Unknown'
  }
}
