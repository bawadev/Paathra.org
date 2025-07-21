import { z } from 'zod'

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

// Donation booking schema
export const donationBookingSchema = z.object({
  food_type: z.string().min(1, 'Please specify the type of food'),
  estimated_servings: z.string()
    .min(1, 'Please enter estimated servings')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Estimated servings must be a positive number',
    }),
  monks_to_feed: z.string()
    .min(1, 'Please enter number of monks to feed')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Number of monks must be a positive number',
    }),
  special_notes: z.string().optional(),
  contact_phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
})

// Monastery creation schema
export const monasterySchema = z.object({
  name: z.string().min(2, 'Monastery name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete address'),
  contact_phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dietary_requirements: z.string().optional(),
  preferred_meal_times: z.array(z.string()).min(1, 'Please select at least one meal time'),
})

// Donation slot schema
export const donationSlotSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  time_slot: z.string().min(1, 'Please select a time slot'),
  max_donors: z.number().min(1, 'Maximum donors must be at least 1').max(20, 'Maximum donors cannot exceed 20'),
  special_requirements: z.string().optional(),
})

// User types enum for reuse
export const userTypeEnum = z.enum(['donor', 'monastery_admin', 'super_admin'])

// User profile schema
export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  user_types: z.array(userTypeEnum).min(1, 'Please select at least one user type').default(['donor', 'monastery_admin', 'super_admin']),
})

// Export types from schemas
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type DonationBookingInput = z.infer<typeof donationBookingSchema>
export type MonasteryInput = z.infer<typeof monasterySchema>
export type DonationSlotInput = z.infer<typeof donationSlotSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
