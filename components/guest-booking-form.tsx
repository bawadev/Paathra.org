'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Plus, Check, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface GuestProfile {
  id: string
  phone: string
  full_name: string
  email?: string
  address?: string
  notes?: string
}

interface DonationSlot {
  id: string
  date: string
  time_slot: string
  max_donors: number
  current_bookings: number
  meal_type?: string
}

interface GuestBookingFormProps {
  monasteryId: string
  donationSlots: DonationSlot[]
  onBookingComplete?: () => void
  preselectedDate?: string | undefined
}

export function GuestBookingForm({ monasteryId, donationSlots, onBookingComplete, preselectedDate }: GuestBookingFormProps) {
  const t = useTranslations('GuestBookings')
  const [guests, setGuests] = useState<GuestProfile[]>([])
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showGuestSearch, setShowGuestSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<any>(null)
  const [showRegisteredUserAlert, setShowRegisteredUserAlert] = useState(false)

  const [formData, setFormData] = useState({
    phone: '',
    fullName: '',
    email: '',
    address: '',
    foodType: '',
    estimatedServings: 1,
    specialNotes: '',
    donationSlotId: '',
    notes: ''
  })

  // Fetch existing guests for the monastery
  useEffect(() => {
    fetchGuests()
  }, [monasteryId])

  // Fetch monastery data for special requirements
  const [monastery, setMonastery] = useState<{ special_requirements?: string }>({})
  useEffect(() => {
    const fetchMonastery = async () => {
      const { data } = await supabase
        .from('monasteries')
        .select('special_requirements')
        .eq('id', monasteryId)
        .single()
      if (data) {
        setMonastery(data)
      }
    }
    if (monasteryId) {
      fetchMonastery()
    }
  }, [monasteryId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.guest-search-container')) {
        setShowGuestSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('monastery_id', monasteryId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGuests(data)
    }
  }

  const searchGuests = (query: string) => {
    if (!query) return guests
    
    return guests.filter(guest => 
      guest.phone.toLowerCase().includes(query.toLowerCase()) ||
      guest.full_name.toLowerCase().includes(query.toLowerCase())
    )
  }

  const handleGuestSelect = (guest: GuestProfile) => {
    setSelectedGuest(guest)
    setFormData({
      ...formData,
      phone: guest.phone,
      fullName: guest.full_name,
      email: guest.email || '',
      address: guest.address || '',
      notes: guest.notes || ''
    })
    setShowGuestSearch(false)
  }

  const checkForRegisteredUser = async (phone: string) => {
    if (!phone || phone.length < 10) {
      setRegisteredUser(null)
      setShowRegisteredUserAlert(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, address')
        .eq('phone', phone)
        .single()

      if (data && !error) {
        setRegisteredUser(data)
        setShowRegisteredUserAlert(true)
      } else {
        setRegisteredUser(null)
        setShowRegisteredUserAlert(false)
      }
    } catch (error) {
      console.error('Error checking registered user:', error)
      setRegisteredUser(null)
      setShowRegisteredUserAlert(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value })
    
    // If phone is being changed and doesn't match selected guest, clear selection
    if (field === 'phone' && selectedGuest && selectedGuest.phone !== value) {
      setSelectedGuest(null)
    }
    
    // Check for registered user when phone changes
    if (field === 'phone') {
      checkForRegisteredUser(value as string)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if this is a registered user
      if (registeredUser) {
        // Create donor booking instead of guest booking
        const { data: booking, error: bookingError } = await supabase
          .from('donation_bookings')
          .insert({
            donation_slot_id: formData.donationSlotId,
            donor_id: registeredUser.id,
            food_type: formData.foodType,
            estimated_servings: formData.estimatedServings,
            special_notes: formData.specialNotes,
            contact_phone: formData.phone,
            status: 'monastery_approved', // Auto-approve since monastery admin is creating it
            monastery_approved_at: new Date().toISOString(),
            initiated_by: 'monastery_admin'
          })
          .select()
          .single()

        if (bookingError) throw bookingError

        toast.success(`Booking created for registered user ${registeredUser.full_name}! Auto-approved by monastery.`)
      } else {
        // Original guest booking logic
        let guestProfileId = selectedGuest?.id
        let actualSlotId = formData.donationSlotId

        // Check if we need to create a new slot (for slots with temporary IDs)
        if (formData.donationSlotId.startsWith('new-')) {
          const selectedSlot = availableSlots.find(slot => slot.id === formData.donationSlotId)
          if (selectedSlot) {
            // Create the donation slot first
            const { data: newSlot, error: slotError } = await supabase
              .from('donation_slots')
              .insert({
                monastery_id: monasteryId,
                date: selectedSlot.date,
                time_slot: selectedSlot.time_slot,
                max_donors: selectedSlot.max_donors,
                current_bookings: 0,
                is_available: true,
                meal_type: selectedSlot.meal_type,
                monks_capacity: (selectedSlot as any).monks_capacity || 50,
                monks_fed: 0
              })
              .select()
              .single()

            if (slotError) throw slotError
            actualSlotId = newSlot.id
          }
        }

        // Create or update guest profile
        if (!selectedGuest) {
          const { data: newGuest, error: guestError } = await supabase
            .from('guest_profiles')
            .insert({
              phone: formData.phone,
              full_name: formData.fullName,
              email: formData.email || null,
              address: formData.address || null,
              notes: formData.notes || null,
              monastery_id: monasteryId
            })
            .select()
            .single()

          if (guestError) throw guestError
          guestProfileId = newGuest.id
        } else if (formData.phone !== selectedGuest.phone ||
                   formData.fullName !== selectedGuest.full_name ||
                   formData.email !== selectedGuest.email ||
                   formData.address !== selectedGuest.address ||
                   formData.notes !== selectedGuest.notes) {
          // Update existing guest
          const { error: updateError } = await supabase
            .from('guest_profiles')
            .update({
              phone: formData.phone,
              full_name: formData.fullName,
              email: formData.email || null,
              address: formData.address || null,
              notes: formData.notes || null
            })
            .eq('id', selectedGuest.id)

          if (updateError) throw updateError
        }

        // Create guest booking
        const { error: bookingError } = await supabase
          .from('guest_bookings')
          .insert({
            donation_slot_id: actualSlotId,
            guest_profile_id: guestProfileId,
            food_type: formData.foodType,
            estimated_servings: formData.estimatedServings,
            special_notes: formData.specialNotes,
            contact_phone: formData.phone,
            status: 'pending'
          })

        if (bookingError) throw bookingError

        toast.success("Guest booking created successfully!")
      }

      // Reset form
      setFormData({
        phone: '',
        fullName: '',
        email: '',
        address: '',
        foodType: '',
        estimatedServings: 1,
        specialNotes: '',
        donationSlotId: '',
        notes: ''
      })
      setSelectedGuest(null)
      setRegisteredUser(null)
      setShowRegisteredUserAlert(false)

      // Store the selected date for restoration when returning to calendar
      if (preselectedDate) {
        const restoreData = {
          selectedDate: preselectedDate,
          monasteryId: monasteryId,
          timestamp: new Date().toISOString()
        }
        sessionStorage.setItem('guestBookingPreselection', JSON.stringify(restoreData))
      }

      if (onBookingComplete) {
        onBookingComplete()
      }

    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = searchGuests(searchQuery)
  
  // Filter slots based on preselected date if provided
  const availableSlots = donationSlots.filter(slot => {
    // Compare dates only (ignore time) for availability check
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const slotDate = new Date(slot.date)
    slotDate.setHours(0, 0, 0, 0)
    
    // For preselected dates from CalendarBookingView, use the provided current_bookings
    // For database slots, use the provided current_bookings (which may be calculated)
    const isAvailable = slot.current_bookings < slot.max_donors && slotDate >= today
    
    if (preselectedDate) {
      const preselectedDateOnly = preselectedDate.split('T')[0] // Get just the date part
      return isAvailable && slot.date === preselectedDateOnly
    }
    
    return isAvailable
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('createBooking')}</CardTitle>
        <CardDescription>
          {preselectedDate
            ? `Creating booking for ${format(new Date(preselectedDate), 'MMMM d, yyyy')}`
            : t('createBookingDesc')
          }
        </CardDescription>
        {preselectedDate && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Date pre-selected from calendar - {availableSlots.length} slot(s) available
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Registered User Alert */}
          {showRegisteredUserAlert && registeredUser && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Registered User Found</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    {registeredUser.full_name} ({registeredUser.phone}) is a registered user. 
                    This booking will be created as a donor booking and auto-approved by the monastery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guest Selection */}
          <div className="space-y-2">
            <Label>{t('selectGuest')}</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowGuestSearch(true)}
                />
                {showGuestSearch && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredGuests.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">{t('noGuestsFound')}</div>
                    ) : (
                      filteredGuests.map((guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => {
                            handleGuestSelect(guest)
                            setShowGuestSearch(false)
                          }}
                        >
                          <div className="font-medium">{guest.full_name}</div>
                          <div className="text-sm text-gray-500">{guest.phone}</div>
                          {guest.email && <div className="text-xs text-gray-400">{guest.email}</div>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedGuest(null)
                  setFormData({
                    phone: '',
                    fullName: '',
                    email: '',
                    address: '',
                    foodType: '',
                    estimatedServings: 1,
                    specialNotes: '',
                    donationSlotId: '',
                    notes: ''
                  })
                  setSearchQuery('')
                  setRegisteredUser(null)
                  setShowRegisteredUserAlert(false)
                }}
              >
                <Plus className="h-4 w-4" />
                {t('newGuest')}
              </Button>
            </div>
            {selectedGuest && (
              <div className="text-sm text-green-600 flex items-center">
                <Check className="w-4 h-4 mr-1" />
                {t('selectedGuest')}: {selectedGuest.full_name} ({selectedGuest.phone})
              </div>
            )}
          </div>

          {/* Guest Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneNumber')} *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="07X-XXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')} *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder={registeredUser ? registeredUser.full_name : "Guest full name"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('guestEmail')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={registeredUser ? registeredUser.email : "guest@email.com"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('guestAddress')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={registeredUser ? registeredUser.address : "Guest address"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('guestNotes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special notes about this guest..."
              rows={2}
            />
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donationSlot">{t('donationSlot')} *</Label>
              <select
                id="donationSlot"
                value={formData.donationSlotId}
                onChange={(e) => handleInputChange('donationSlotId', e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">{t('selectSlot')}</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {format(new Date(slot.date), 'MMM d')} - {slot.meal_type || 'Meal'} at {slot.time_slot}
                    ({slot.current_bookings || 0}/{slot.max_donors || 0} booked)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodType">{t('foodType')} *</Label>
              <Input
                id="foodType"
                value={formData.foodType}
                onChange={(e) => handleInputChange('foodType', e.target.value)}
                placeholder="Rice & curry, fruits, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedServings">{t('estimatedServings')} *</Label>
              <Input
                id="estimatedServings"
                type="number"
                min="1"
                value={formData.estimatedServings}
                onChange={(e) => handleInputChange('estimatedServings', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          {monastery.special_requirements && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">{t('specialRequirements')}</h4>
                  <p className="mt-1 text-sm text-blue-700">{monastery.special_requirements}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="specialNotes">{t('specialNotes')}</Label>
            <Textarea
              id="specialNotes"
              value={formData.specialNotes}
              onChange={(e) => handleInputChange('specialNotes', e.target.value)}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('loading') : t('createBookingBtn')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}