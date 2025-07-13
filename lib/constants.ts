export const APP_CONFIG = {
  name: 'Dhaana',
  description: 'Connect donors with monasteries for meaningful food donations',
  version: '0.1.0',
} as const

export const ROUTES = {
  HOME: '/',
  DONATE: '/donate',
  MY_DONATIONS: '/my-donations',
  MONASTERIES: '/monasteries',
  
  // Management routes
  MANAGE: {
    ROOT: '/manage',
    MONASTERY: '/manage/monastery',
    BOOKINGS: '/manage/bookings',
    SLOTS: '/manage/slots',
  },
  
  // Admin routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    MONASTERIES: '/admin/monasteries',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
} as const

export const USER_ROLES = {
  DONOR: 'donor',
  MONASTERY_ADMIN: 'monastery_admin',
  SUPER_ADMIN: 'super_admin',
} as const

export const MEAL_TIMES = [
  'Breakfast (6:00 AM - 9:00 AM)',
  'Lunch (11:00 AM - 2:00 PM)',
  'Dinner (5:00 PM - 8:00 PM)',
  'Snacks (3:00 PM - 5:00 PM)',
] as const

export const MAX_DONATION_SLOTS = 20 as const
export const MIN_DONATION_SERVINGS = 1 as const

export const CONTACT_PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
} as const

export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Your donation has been booked successfully!',
  MONASTERY_CREATED: 'Monastery has been created successfully!',
  SLOT_CREATED: 'Donation slot has been created successfully!',
  PROFILE_UPDATED: 'Your profile has been updated successfully!',
} as const
