'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { DonationCalendar } from '@/components/features/donation/DonationCalendar'
import { DonationBookingForm } from '@/components/donation-booking-form'
import { DonationSlot } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { Heart, Users, Gift } from 'lucide-react'
import { BookingConfirmationDialog } from '@/components/booking-confirmation-dialog'

export default function DonatePage() {
  const { user, loading } = useAuth()
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {selectedSlot ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
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
