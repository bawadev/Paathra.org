'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, DonationSlot } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  const [formData, setFormData] = useState({
    food_type: '',
    estimated_servings: '',
    special_notes: '',
    contact_phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error: bookingError } = await supabase
        .from('donation_bookings')
        .insert({
          donation_slot_id: slot.id,
          donor_id: user.id,
          food_type: formData.food_type,
          estimated_servings: parseInt(formData.estimated_servings),
          special_notes: formData.special_notes || null,
          contact_phone: formData.contact_phone || null,
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              <span>{slot.current_bookings}/{slot.max_donors} booked</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{slot.monastery?.address}</span>
            </div>
          </div>

          {slot.special_requirements && (
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Special Requirements:</strong> {slot.special_requirements}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="food_type">Type of Food *</Label>
              <Input
                id="food_type"
                value={formData.food_type}
                onChange={(e) => handleInputChange('food_type', e.target.value)}
                placeholder="e.g., Rice and curry, Noodles, Sandwiches"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated_servings">Estimated Servings *</Label>
              <Input
                id="estimated_servings"
                type="number"
                min="1"
                value={formData.estimated_servings}
                onChange={(e) => handleInputChange('estimated_servings', e.target.value)}
                placeholder="Number of people this will serve"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              placeholder="Your phone number for coordination"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_notes">Special Notes</Label>
            <Textarea
              id="special_notes"
              value={formData.special_notes}
              onChange={(e) => handleInputChange('special_notes', e.target.value)}
              placeholder="Any additional information about your donation (ingredients, allergies, etc.)"
              rows={3}
            />
          </div>

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
      </CardContent>
    </Card>
  )
}
