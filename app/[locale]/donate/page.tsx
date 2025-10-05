'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Navigation } from '@/components/organisms/Navigation'
import { DonationCalendar } from '@/components/features/donation/DonationCalendar'
import { DonationBookingForm } from '@/components/donation-booking-form'
import { DonationSlot } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { Heart, Users, Gift } from 'lucide-react'
import { BookingConfirmationDialog } from '@/components/booking-confirmation-dialog'

export default function DonatePage() {
  const { user, loading } = useAuthStore()
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

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

  const handleBookingSuccess = async (bookingData: any) => {
    // Fetch the full booking details including monastery info
    const { data: bookingDetails } = await supabase
      .from('donation_bookings')
      .select(`
        *,
        donation_slots!inner(
          *,
          monasteries!inner(*)
        )
      `)
      .eq('id', bookingData.id)
      .single()
    
    if (bookingDetails) {
      setConfirmedBooking(bookingDetails)
      setBookingSuccess(true)
    }
    setSelectedSlot(null)
  }

  const handleBookingCancel = () => {
    setSelectedSlot(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-red-50/50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {selectedSlot ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-elegant-lg border border-amber-100/50 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="outline"
                  onClick={handleBookingCancel}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md"
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
              <DonationCalendar onSlotSelect={handleSlotSelect} />
            </div>
          )}
        </div>

        {/* Impact Stats */}
        {!selectedSlot && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="group relative bg-gradient-to-br from-compassion-50 to-compassion-50 rounded-2xl p-8 text-center shadow-elegant border border-compassion-100/50 hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-compassion-200/20 rounded-full blur-2xl -z-10 group-hover:bg-compassion-300/30 transition-colors duration-300"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-compassion-500 to-compassion-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1,250+ Meals</h3>
              <p className="text-sm font-medium text-gray-600">Provided this month</p>
            </div>

            <div className="group relative bg-gradient-to-br from-trust-50 to-trust-50 rounded-2xl p-8 text-center shadow-elegant border border-trust-100/50 hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-trust-200/20 rounded-full blur-2xl -z-10 group-hover:bg-trust-300/30 transition-colors duration-300"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-trust-500 to-trust-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">85+ Donors</h3>
              <p className="text-sm font-medium text-gray-600">Active this week</p>
            </div>

            <div className="group relative bg-gradient-to-br from-spiritual-50 to-spiritual-50 rounded-2xl p-8 text-center shadow-elegant border border-spiritual-100/50 hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-spiritual-200/20 rounded-full blur-2xl -z-10 group-hover:bg-spiritual-300/30 transition-colors duration-300"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-spiritual-500 to-spiritual-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">12 Monasteries</h3>
              <p className="text-sm font-medium text-gray-600">Receiving donations</p>
            </div>
          </div>
        )}
      </main>

      {/* Booking Confirmation Dialog */}
      <BookingConfirmationDialog
        isOpen={bookingSuccess}
        onClose={() => {
          setBookingSuccess(false)
          setConfirmedBooking(null)
        }}
        booking={confirmedBooking}
      />
    </div>
  )
}
