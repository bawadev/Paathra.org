'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { DonationCalendar } from '@/components/donation-calendar'
import { DonationBookingForm } from '@/components/donation-booking-form'
import { DonationSlot } from '@/lib/supabase'
import { AuthForm } from '@/components/auth-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

export default function DonatePage() {
  const { user, loading } = useAuth()
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const handleSlotSelect = (slot: DonationSlot) => {
    setSelectedSlot(slot)
    setBookingSuccess(false)
  }

  const handleBookingSuccess = () => {
    setBookingSuccess(true)
    setSelectedSlot(null)
  }

  const handleBookingCancel = () => {
    setSelectedSlot(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Food Donation</h1>
          <p className="text-gray-600">
            Select a time slot and monastery to schedule your food donation.
          </p>
        </div>

        {bookingSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your donation has been successfully booked! You'll receive confirmation details soon.
            </AlertDescription>
          </Alert>
        )}

        {selectedSlot ? (
          <DonationBookingForm
            slot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingCancel}
          />
        ) : (
          <DonationCalendar onSlotSelect={handleSlotSelect} />
        )}
      </main>
    </div>
  )
}
