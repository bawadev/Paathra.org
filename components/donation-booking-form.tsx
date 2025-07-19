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
      special_notes: '',
      contact_phone: '',
    },
  })

  const handleSubmit = async (data: DonationBookingInput) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error: bookingError } = await supabase
        .from('donation_bookings')
        .insert({
          donation_slot_id: slot.id,
          donor_id: user.id,
          food_type: data.food_type,
          estimated_servings: parseInt(data.estimated_servings),
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
    <Card className="card-dana max-w-2xl mx-auto fade-in">
      <CardHeader>
        <CardTitle>Book Donation Slot</CardTitle>
        <CardDescription>
          Complete the form below to book your food donation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Slot Details */}
        <div className="bg-[var(--bg-light)] p-4 rounded-lg" style={{marginBottom: 'var(--card-spacing)'}}>
          <h3 className="font-medium text-[var(--text-dark)]" style={{marginBottom: 'var(--space-2)'}}>
            {slot.monastery?.name}
          </h3>
          
          <div className="grid-dana grid-cols-1 md:grid-cols-3 text-sm text-[var(--text-light)]">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-[var(--primary-color)]" />
              <span>
                {format(parseISO(slot.date), 'MMM d, yyyy')} at{' '}
                {format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-[var(--primary-color)]" />
              <span>{slot.current_bookings}/{slot.max_donors} booked</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
              <span>{slot.monastery?.address}</span>
            </div>
          </div>

          {slot.special_requirements && (
            <div className="mt-3 text-sm text-[var(--primary-color)] bg-[var(--primary-color)]/5 p-2 rounded">
              <strong>Special Requirements:</strong> {slot.special_requirements}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 fade-in-2">
            <div className="grid-dana grid-cols-1 md:grid-cols-2">
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

            <div className="flex gap-4" style={{paddingTop: 'var(--space-6)'}}>
              <Button type="submit" disabled={loading}
                      className="flex-1 btn-dana btn-dana-primary">
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                    Booking...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}
                      className="btn-dana btn-dana-secondary">
                Cancel
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
