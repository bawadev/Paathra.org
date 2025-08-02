'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { DonationCalendar } from '@/components/features/donation/DonationCalendar'
import { DonationBookingForm } from '@/components/donation-booking-form'
import { DonationSlot } from '@/lib/supabase'
import { AuthForm } from '@/components/auth-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle, Heart, Users, Gift } from 'lucide-react'

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

  const handleSlotSelect = (slot: DonationSlot | null) => {
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a Food Donation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule your food donation to support monasteries and provide meals for monks. 
            Every donation makes a meaningful impact.
          </p>
        </div>

        {/* Success Alert */}
        {bookingSuccess && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Alert className="border-green-200 bg-green-50 shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">
                    Booking Confirmed!
                  </h3>
                  <p className="text-green-700">
                    Your donation has been successfully booked. You'll receive confirmation details via email shortly.
                  </p>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {selectedSlot ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Booking
                  </h2>
                  <p className="text-gray-600">
                    Review the details and confirm your donation
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleBookingCancel}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  ← Back to Calendar
                </Button>
              </div>
              
              <DonationBookingForm
                slot={selectedSlot}
                onSuccess={handleBookingSuccess}
                onCancel={handleBookingCancel}
              />
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                  Choose Your Donation Date
                </h2>
                <p className="text-center text-gray-600 max-w-lg mx-auto">
                  Select a date and time slot that works for you. Available slots are shown in green.
                </p>
              </div>
              
              <DonationCalendar onSlotSelect={handleSlotSelect} />
            </div>
          )}
        </div>

        {/* Impact Stats */}
        {!selectedSlot && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">1,250+ Meals</h3>
              <p className="text-sm text-gray-600">Provided this month</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">85+ Donors</h3>
              <p className="text-sm text-gray-600">Active this week</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">12 Monasteries</h3>
              <p className="text-sm text-gray-600">Receiving donations</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
