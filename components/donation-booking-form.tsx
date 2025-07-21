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

interface DonationBookingFormProps {
  slot: DonationSlot
  onSuccess: () => void
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
      monks_to_feed: '',
      special_notes: '',
      contact_phone: '',
    },
  })

  const handleSubmit = async (data: DonationBookingInput) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const monksToFeed = parseInt(data.monks_to_feed)
      
      // Check if there's enough capacity left
      const remainingCapacity = slot.monks_capacity - slot.monks_fed
      if (monksToFeed > remainingCapacity) {
        setError(`Only ${remainingCapacity} monks can be fed for this slot. Please reduce the number or check other available slots.`)
        setLoading(false)
        return
      }

      // Optimistic check: re-fetch slot data to ensure it hasn't changed
      const { data: currentSlot, error: fetchError } = await supabase
        .from('donation_slots')
        .select('monks_capacity, monks_fed')
        .eq('id', slot.id)
        .single()

      if (fetchError) {
        setError('Unable to verify slot availability. Please try again.')
        setLoading(false)
        return
      }

      const currentRemainingCapacity = currentSlot.monks_capacity - currentSlot.monks_fed
      if (monksToFeed > currentRemainingCapacity) {
        setError(`This slot was just updated! Only ${currentRemainingCapacity} monks can be fed now. Please adjust your donation or try another slot.`)
        setLoading(false)
        return
      }

      const { error: bookingError } = await supabase
        .from('donation_bookings')
        .insert({
          donation_slot_id: slot.id,
          donor_id: user.id,
          donation_date: slot.date,
          food_type: data.food_type,
          estimated_servings: parseInt(data.estimated_servings),
          monks_to_feed: monksToFeed,
          special_notes: data.special_notes || null,
          contact_phone: data.contact_phone || null,
        })

      if (bookingError) {
        setError(bookingError.message)
      } else {
        onSuccess()
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
          <h3 className="font-medium mb-2">{slot.monastery?.name}</h3>
          
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
              <span>{slot.monks_fed}/{slot.monks_capacity} monks fed</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{slot.monastery?.address}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Feeding Progress</span>
              <span>{slot.monks_capacity - slot.monks_fed} monks remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(slot.monks_fed / slot.monks_capacity) * 100}%` }}
              ></div>
            </div>
          </div>

          {slot.special_requirements && (
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Special Requirements:</strong> {slot.special_requirements}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                name="food_type"
                label="Type of Food"
                placeholder="e.g., Rice and curry, Noodles, Sandwiches"
                required
              />
              
              <TextField
                name="estimated_servings"
                label="Estimated Servings"
                placeholder="Number of people this will serve"
                required
              />

              <TextField
                name="monks_to_feed"
                label="Monks to Feed"
                placeholder={`Max ${slot.monks_capacity - slot.monks_fed} remaining`}
                required
              />
            </div>

            <TextField
              name="contact_phone"
              label="Contact Phone"
              type="tel"
              placeholder="Your phone number for coordination"
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
