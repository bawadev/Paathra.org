'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { GuestBookingForm } from '@/components/guest-booking-form'
import { ManageGuestBookings } from '@/components/manage-guest-bookings'
import { supabase, Monastery, DonationSlot } from '@/lib/supabase'
import { hasRole } from '@/types/auth'
import { Card, CardContent } from '@/components/ui/card'

export default function GuestBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<Monastery | null>(null)
  const [donationSlots, setDonationSlots] = useState<DonationSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')

  useEffect(() => {
    if (user && hasRole(profile, 'monastery_admin')) {
      fetchMonasteryData()
    }
  }, [user, profile])

  const fetchMonasteryData = async () => {
    if (!user) return

    setLoading(true)
    
    // Fetch monastery
    const { data: monasteryData } = await supabase
      .from('monasteries')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (monasteryData) {
      setMonastery(monasteryData)
      
      // Fetch available donation slots
      const { data: slotsData } = await supabase
        .from('donation_slots')
        .select('*')
        .eq('monastery_id', monasteryData.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      setDonationSlots(slotsData || [])
    }
    
    setLoading(false)
  }

  const refreshData = () => {
    fetchMonasteryData()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (!hasRole(profile, 'monastery_admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 text-yellow-500 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-gray-600">
                This page is only available to monastery administrators.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {monastery ? `${monastery.name} - Guest Bookings` : 'Guest Bookings'}
          </h1>
          <p className="text-gray-600">
            Create and manage bookings for guests who call to make reservations.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading data...</div>
        ) : !monastery ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V3a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Monastery Found</h3>
              <p className="text-gray-600 mb-6">
                You don't seem to be associated with a monastery yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Create Guest Booking
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'manage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Guest Bookings
                </button>
              </nav>
            </div>
            
            {activeTab === 'create' && (
              <div>
                <GuestBookingForm 
                  monasteryId={monastery.id} 
                  donationSlots={donationSlots}
                  onBookingComplete={refreshData}
                />
              </div>
            )}
            
            {activeTab === 'manage' && (
              <div>
                <ManageGuestBookings monasteryId={monastery.id} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}