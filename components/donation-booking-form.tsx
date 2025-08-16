'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/auth-context'
import { supabase, DonationSlot } from '@/lib/supabase'
import { donationBookingSchema, type DonationBookingInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TextField, TextareaField } from '@/components/forms/FormFields'
import { format, parseISO } from 'date-fns'
import { Clock, MapPin, Users } from 'lucide-react'

// Extended slot type with monastery data
interface ExtendedDonationSlot extends DonationSlot {
  monastery?: {
    name: string
    capacity: number
    address: string
    special_requirements?: string
  }
  monastery_name?: string
  monastery_address?: string
}

interface DonationBookingFormProps {
  slot: ExtendedDonationSlot
  onSuccess: (bookingData: any) => void
  onCancel: () => void
}

export function DonationBookingForm({ slot, onSuccess, onCancel }: DonationBookingFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<DonationBookingInput>({
    resolver: zodResolver(donationBookingSchema),
    defaultValues: {
      food_type: '',
      estimated_servings: '',
      special_notes: '',
      contact_phone: '',
    },
  })

  const handleSubmit = async (data: DonationBookingInput) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const estimatedServings = parseInt(data.estimated_servings)
      
      // Get the effective capacity (monastery capacity or slot capacity)
      const effectiveCapacity = slot.monastery?.capacity || slot.monks_capacity || 0
      const remainingCapacity = effectiveCapacity - (slot.monks_fed || 0)
      
      if (estimatedServings > remainingCapacity) {
        setError(`Only ${remainingCapacity} servings capacity remaining for this slot. Please reduce the servings or check other available slots.`)
        setLoading(false)
        return
      }

      // Optimistic check: re-fetch slot data to ensure it hasn't changed
      const { data: currentSlot, error: fetchError } = await supabase
        .from('donation_slots')
        .select(`
          monks_capacity,
          monks_fed,
          monastery:monasteries(capacity)
        `)
        .eq('id', slot.id)
        .single()

      if (fetchError) {
        setError('Unable to verify slot availability. Please try again.')
        setLoading(false)
        return
      }

      const currentEffectiveCapacity = (currentSlot as any).monastery?.capacity || currentSlot.monks_capacity || 0
      const currentRemainingCapacity = currentEffectiveCapacity - (currentSlot.monks_fed || 0)
      
      if (estimatedServings > currentRemainingCapacity) {
        setError(`This slot was just updated! Only ${currentRemainingCapacity} servings capacity remaining now. Please adjust your donation or try another slot.`)
        setLoading(false)
        return
      }

      // Use a transaction to ensure both booking creation and slot update happen atomically
      const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_with_slot_update', {
        p_donation_slot_id: slot.id,
        p_donor_id: user.id,
        p_donation_date: slot.date,
        p_food_type: data.food_type,
        p_estimated_servings: estimatedServings,
        p_contact_phone: data.contact_phone,
        p_special_notes: data.special_notes || null
      })

      if (bookingError) {
        setError(bookingError.message)
      } else {
        onSuccess(bookingData)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book Donation Slot</CardTitle>
        <CardDescription>
          Complete the form below to book your food donation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Slot Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">{slot.monastery?.name || slot.monastery_name || 'Monastery'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {format(parseISO(slot.date), 'MMM d, yyyy')} at{' '}
                {format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{slot.monks_fed || 0}/{slot.monastery?.capacity || slot.monks_capacity || 0} servings capacity used</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{slot.monastery?.address || slot.monastery_address || 'Address not provided'}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Capacity Usage</span>
              <span>{(slot.monastery?.capacity || slot.monks_capacity || 0) - (slot.monks_fed || 0)} servings capacity remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((slot.monks_fed || 0) / (slot.monastery?.capacity || slot.monks_capacity || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {(slot.monastery?.special_requirements || slot.special_requirements) && (
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Special Requirements for {slot.monastery?.name || slot.monastery_name || 'the monastery'}</h4>
                  <p className="mt-1 text-sm text-blue-700">{slot.monastery?.special_requirements || slot.special_requirements}</p>
                </div>
              </div>
            </div>
          )}

          {slot.booking_notes && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">Important Notes from {slot.monastery?.name || slot.monastery_name || 'the monastery'}</h4>
                  <p className="mt-1 text-sm text-amber-700">{slot.booking_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                name="food_type"
                label="Type of Food"
                placeholder="e.g., Rice and curry, Noodles, Sandwiches"
                required
              />
              
              <TextField
                name="estimated_servings"
                label="Estimated Servings"
                placeholder={`Max ${(slot.monastery?.capacity || slot.monks_capacity || 0) - (slot.monks_fed || 0)} servings remaining`}
                required
              />
            </div>

            <TextField
              name="contact_phone"
              label="Contact Phone"
              type="tel"
              placeholder="Your phone number for coordination"
              required
            />

            <TextareaField
              name="special_notes"
              label="Special Notes"
              placeholder="Any additional information about your donation (ingredients, allergies, etc.)"
              rows={3}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
