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
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full pulse"></div>
          <div className="text-lg text-[var(--text-light)] fade-in">Loading...</div>
        </div>
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
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="container-dana section-dana">
        <div className="text-center" style={{
          marginBottom: 'var(--section-spacing)',
          paddingTop: 'var(--header-height)'
        }}>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text fade-in-1"
              style={{marginBottom: 'var(--space-4)'}}>
            Make a Food Donation
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-light)] max-w-2xl mx-auto fade-in-2">
            Select a time slot and monastery to schedule your food donation.
          </p>
        </div>

        {bookingSuccess && (
          <Alert className="mb-6 border-[var(--primary-color)] bg-[var(--primary-color)]/5 fade-in">
            <CheckCircle className="h-4 w-4 text-[var(--primary-color)]" />
            <AlertDescription className="text-[var(--text-dark)]">
              Your donation has been successfully booked! You'll receive confirmation details soon.
            </AlertDescription>
          </Alert>
        )}

        <div className="fade-in">
          {selectedSlot ? (
            <div className="max-w-2xl mx-auto">
              <DonationBookingForm
                slot={selectedSlot}
                onSuccess={handleBookingSuccess}
                onCancel={handleBookingCancel}
              />
            </div>
          ) : (
            <DonationCalendar onSlotSelect={handleSlotSelect} />
          )}
        </div>
      </main>
    </div>
  )
}
