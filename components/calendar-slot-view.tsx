'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Calendar, Edit3, Trash2, Check, X, Plus, UserPlus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface DonationSlot {
  id: string
  date: string
  time_slot: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  monks_capacity: number
  max_donors: number
  current_bookings: number
  is_available: boolean
  booking_notes?: string
  monks_fed: number
}

interface Booking {
  id: string
  donation_slots: {
    id: string
    date: string
    time: string
    capacity: number
    special_requirements?: string
  }
  food_type: string
  estimated_servings: number
  status: string
  special_notes?: string
  user_profiles: {
    full_name: string
    email: string
    phone?: string
  }
  created_at: string
}

interface CalendarSlotViewProps {
  monasteryId: string
  bookings: Booking[]
  userId?: string
  onBookingAction?: (bookingId: string, action: string) => void
  onCreateGuestBooking?: (date: Date, availableSlots: DonationSlot[]) => void
  onBookingCreated?: () => void
}

interface Monastery {
  id: string
  capacity: number
  breakfast_time?: string
  lunch_time?: string
  dinner_time?: string
}

export function CalendarSlotView({ monasteryId, bookings, onBookingAction, userId, onCreateGuestBooking, onBookingCreated }: CalendarSlotViewProps) {
  const tCalendar = useTranslations('CalendarSlotView')
  const tSlot = useTranslations('SlotDialog')
  const tBooking = useTranslations('BookingDialog')
  const tCommon = useTranslations('Common')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [donationSlots, setDonationSlots] = useState<DonationSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [createSlotDialogOpen, setCreateSlotDialogOpen] = useState(false)
  const [editSlotDialogOpen, setEditSlotDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)
  const [bulkSlotDialogOpen, setBulkSlotDialogOpen] = useState(false)
  const [monastery, setMonastery] = useState<Monastery | null>(null)

  // Form state for slot creation/editing
  const [formData, setFormData] = useState({
    date: '',
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner',
    time_slot: '11:30',
    monks_capacity: 10,
    max_donors: 5,
    booking_notes: ''
  })

  // Form state for booking dialog
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingFormData, setBookingFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    food_type: '',
    estimated_servings: 1,
    special_notes: '',
    selected_slot_id: '',
    selected_time: ''
  })
  const [creatingBooking, setCreatingBooking] = useState(false)

  // Phone lookup state
  const [phoneLookup, setPhoneLookup] = useState({
    loading: false,
    found: false,
    error: '',
    isGuest: false
  })

  // Restore selected date from sessionStorage on component mount
  useEffect(() => {
    const storedBookingData = sessionStorage.getItem('guestBookingPreselection')
    if (storedBookingData) {
      try {
        const bookingData = JSON.parse(storedBookingData)
        if (bookingData.selectedDate && bookingData.monasteryId === monasteryId) {
          const storedDate = new Date(bookingData.selectedDate)
          setSelectedDate(storedDate)
          setCurrentDate(storedDate) // Also update current month view
        }
        // Clear the stored data after using it
        sessionStorage.removeItem('guestBookingPreselection')
      } catch (error) {
        console.error('Error parsing stored booking data:', error)
        sessionStorage.removeItem('guestBookingPreselection')
      }
    }
  }, [monasteryId])

  // Fetch monastery details
  useEffect(() => {
    const fetchMonastery = async () => {
      const { data } = await supabase
        .from('monasteries')
        .select('*')
        .eq('id', monasteryId)
        .single()
      
      if (data) {
        setMonastery(data)
      }
    }
    fetchMonastery()
  }, [monasteryId])

  const fetchSlotsForDate = useCallback(async (date: Date) => {
    setLoadingSlots(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const { data: slots } = await supabase
      .from('donation_slots')
      .select(`
        *,
        donation_bookings(
          estimated_servings,
          status
        )
      `)
      .eq('monastery_id', monasteryId)
      .eq('date', dateStr)
      .order('time_slot')

    // Calculate actual servings for each slot
    const slotsWithCalculatedData = (slots || []).map(slot => {
      const activeBookings = slot.donation_bookings?.filter(
        booking => booking.status !== 'cancelled'
      ) || []
      
      const totalServings = activeBookings.reduce(
        (sum, booking) => sum + (booking.estimated_servings || 0), 
        0
      )
      
      return {
        ...slot,
        monks_fed: totalServings,
        current_bookings: activeBookings.length,
        // Remove the nested bookings data to keep the interface clean
        donation_bookings: undefined
      }
    })

    setDonationSlots(slotsWithCalculatedData)
    setLoadingSlots(false)
  }, [monasteryId])

  // Fetch slots for selected date
  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate)
    }
  }, [selectedDate, fetchSlotsForDate])

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  // Get existing bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = format(parseISO(booking.donation_slots.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Get slot occupancy info - commented out as not currently used
  // const getSlotOccupancy = (date: Date) => {
  //   const dateKey = format(date, 'yyyy-MM-dd')
  //   const dayBookings = bookingsByDate[dateKey] || []
  //
  //   // Count bookings by time slot (actual booking count, not servings)
  //   const slotBookings = dayBookings.reduce((acc, booking) => {
  //     const time = booking.donation_slots.time
  //     if (!acc[time]) acc[time] = 0
  //     acc[time] += 1 // Count actual bookings, not servings
  //     return acc
  //   }, {} as Record<string, number>)
  //
  //   return slotBookings
  // }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    // Reset form data for new slot
    setFormData({
      date: format(date, 'yyyy-MM-dd'),
      meal_type: 'lunch',
      time_slot: '11:30',
      monks_capacity: monastery?.capacity || 10,
      max_donors: 5,
      booking_notes: ''
    })
  }

  const createSlot = async () => {
    if (!selectedDate || !monastery) {
      console.error('Missing selectedDate or monastery');
      return;
    }

    try {
      // Check if slot already exists
      const existingSlot = donationSlots.find(
        slot => slot.meal_type === formData.meal_type && slot.date === formData.date
      )

      if (existingSlot) {
        alert(`A ${formData.meal_type} slot already exists for this date`)
        return
      }

      console.log('Creating slot with data:', formData);
      
      const { error } = await supabase
        .from('donation_slots')
        .insert({
          monastery_id: monasteryId,
          date: formData.date,
          time_slot: formData.time_slot,
          meal_type: formData.meal_type,
          monks_capacity: formData.monks_capacity,
          max_donors: formData.max_donors,
          booking_notes: formData.booking_notes || null,
          is_available: true,
          monks_fed: 0,
          current_bookings: 0,
          created_by: userId || null
        })

      if (error) {
        console.error('Error creating slot:', error);
        alert(`Error creating slot: ${error.message}`);
      } else {
        setCreateSlotDialogOpen(false)
        fetchSlotsForDate(selectedDate)
        
        // Notify parent component to refresh data
        if (onBookingCreated) {
          onBookingCreated()
        }
        
        // Update monastery default time if changed
        if (formData.time_slot !== getDefaultTime(formData.meal_type)) {
          const updateField = `${formData.meal_type}_time`
          await supabase
            .from('monasteries')
            .update({ [updateField]: `${formData.time_slot}:00` })
            .eq('id', monasteryId)
        }
      }
    } catch (error) {
      console.error('Unexpected error creating slot:', error);
      alert('An unexpected error occurred while creating the slot');
    }
  }

  const updateSlot = async () => {
    if (!selectedSlot) return

    const { error } = await supabase
      .from('donation_slots')
      .update({
        time_slot: formData.time_slot,
        monks_capacity: formData.monks_capacity,
        max_donors: formData.max_donors,
        booking_notes: formData.booking_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedSlot.id)

    if (!error) {
      setEditSlotDialogOpen(false)
      fetchSlotsForDate(selectedDate!)
    }
  }

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('donation_slots')
      .delete()
      .eq('id', slotId)

    if (!error) {
      fetchSlotsForDate(selectedDate!)
    }
  }

  const toggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    const { error } = await supabase
      .from('donation_slots')
      .update({ is_available: !isAvailable })
      .eq('id', slotId)

    if (!error) {
      fetchSlotsForDate(selectedDate!)
    }
  }

  const createBulkSlots = async () => {
    if (!selectedDate || !monastery) return

    const mealSlots = [
      { time: '07:00', meal_type: 'breakfast' },
      { time: '11:30', meal_type: 'lunch' },
      { time: '17:00', meal_type: 'dinner' }
    ]
    const slots = []

    // Create slots for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() + i)
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      for (const mealSlot of mealSlots) {
        slots.push({
          monastery_id: monasteryId,
          date: format(date, 'yyyy-MM-dd'),
          time_slot: mealSlot.time,
          meal_type: mealSlot.meal_type,
          monks_capacity: monastery.capacity || 10,
          max_donors: 5,
          booking_notes: null,
          is_available: true,
          monks_fed: 0,
          current_bookings: 0,
          created_by: userId || null
        })
      }
    }

    const { error } = await supabase
      .from('donation_slots')
      .upsert(slots, { 
        onConflict: 'monastery_id,date,meal_type',
        ignoreDuplicates: true 
      })

    if (!error) {
      fetchSlotsForDate(selectedDate)
      setBulkSlotDialogOpen(false)
    }
  }

  const getDefaultTime = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return monastery?.breakfast_time?.substring(0, 5) || '07:00'
      case 'lunch': return monastery?.lunch_time?.substring(0, 5) || '11:30'
      case 'dinner': return monastery?.dinner_time?.substring(0, 5) || '17:00'
      default: return '11:30'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const startEditingSlot = (slot: DonationSlot) => {
    setSelectedSlot(slot)
    setFormData({
      date: slot.date,
      meal_type: slot.meal_type,
      time_slot: slot.time_slot,
      monks_capacity: slot.monks_capacity,
      max_donors: slot.max_donors,
      booking_notes: slot.booking_notes || ''
    })
    setEditSlotDialogOpen(true)
  }

  // Fetch slots for booking dialog
  const getAvailableSlotsForBooking = () => {
    if (!selectedDate) return []
    return donationSlots.filter(slot => slot.is_available && slot.date === format(selectedDate, 'yyyy-MM-dd'))
  }

  // Phone-based donor lookup
  const handlePhoneLookup = async () => {
    const phone = bookingFormData.donor_phone.trim();
    if (!phone) return;

    setPhoneLookup({
      loading: true,
      found: false,
      error: '',
      isGuest: false
    });

    try {
      // First, search in user_profiles
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('phone', phone)
        .single();

      if (userProfile) {
        setBookingFormData(prev => ({
          ...prev,
          donor_name: userProfile.full_name,
          donor_email: userProfile.email
        }));
        setPhoneLookup({
          loading: false,
          found: true,
          error: '',
          isGuest: false
        });
        return;
      }

      // Then, search in guest_profiles
      const { data: guestProfile } = await supabase
        .from('guest_profiles')
        .select('id, full_name, email')
        .eq('phone', phone)
        .single();

      if (guestProfile) {
        setBookingFormData(prev => ({
          ...prev,
          donor_name: guestProfile.full_name,
          donor_email: guestProfile.email,
          guest_profile_id: guestProfile.id
        }));
        setPhoneLookup({
          loading: false,
          found: true,
          error: '',
          isGuest: true
        });
        return;
      }

      // No existing profile found
      setPhoneLookup({
        loading: false,
        found: false,
        error: 'New donor - please complete details',
        isGuest: false
      });
    } catch (error) {
      console.error('Phone lookup error:', error);
      setPhoneLookup({
        loading: false,
        found: false,
        error: 'Error looking up phone number',
        isGuest: false
      });
    }
  };

const createBooking = async () => {
    if (!selectedDate || !monastery) return

    setCreatingBooking(true)

    try {
      let guestId = bookingFormData.guest_profile_id || null;

      // Handle guest profile creation or retrieval
      if (!guestId && bookingFormData.donor_phone) {
        // If we already found the guest profile during lookup, use it
        if (phoneLookup.found && phoneLookup.isGuest) {
          // We should already have the guest_profile_id from the lookup
          // If not, fetch it again
          if (!guestId) {
            const { data: existingGuest } = await supabase
              .from('guest_profiles')
              .select('id')
              .eq('phone', bookingFormData.donor_phone)
              .single();
            
            if (existingGuest) {
              guestId = existingGuest.id;
            }
          }
        } else if (!phoneLookup.found) {
          // Create new guest profile for completely new donor
          const { data: existingGuest } = await supabase
            .from('guest_profiles')
            .select('id')
            .eq('phone', bookingFormData.donor_phone)
            .single();

          if (existingGuest) {
            guestId = existingGuest.id;
          } else {
            // Create new guest profile with dummy email if none provided
            const guestEmail = bookingFormData.donor_email || `guest-${Date.now()}@temp.dhaana.com`;
            const { data: newGuest } = await supabase
              .from('guest_profiles')
              .insert({
                phone: bookingFormData.donor_phone,
                full_name: bookingFormData.donor_name,
                email: guestEmail,
                monastery_id: monasteryId,
                created_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (newGuest) {
              guestId = newGuest.id;
            }
          }
        }
      }

      // Find or create slot for the selected time
      let slotId = bookingFormData.selected_slot_id
      
      if (!slotId) {
        const timeSlot = bookingFormData.selected_time || '12:00:00'
        const formattedTime = timeSlot.includes(':') && !timeSlot.includes(':00') ? `${timeSlot}:00` : timeSlot
        
        // Check if slot already exists
        const { data: existingSlot } = await supabase
          .from('donation_slots')
          .select('id')
          .eq('monastery_id', monasteryId)
          .eq('date', format(selectedDate, 'yyyy-MM-dd'))
          .eq('time_slot', formattedTime)
          .single()

        if (existingSlot) {
          slotId = existingSlot.id
        } else {
          // Create new slot if none exists
          const { data: newSlot, error: slotError } = await supabase
            .from('donation_slots')
            .insert({
              monastery_id: monasteryId,
              date: format(selectedDate, 'yyyy-MM-dd'),
              time_slot: formattedTime,
              meal_type: 'lunch',
              monks_capacity: monastery.capacity || 10,
              max_donors: 5,
              is_available: true,
              monks_fed: 0,
              current_bookings: 0
            })
            .select()
            .single()

          if (slotError) throw slotError
          slotId = newSlot.id
        }
      }

      // Check for duplicate bookings first
      let existingBooking = null;
      
      if (phoneLookup.found && !phoneLookup.isGuest) {
        // Check for existing booking for registered user
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('phone', bookingFormData.donor_phone)
          .single();
          
        if (!userProfile) throw new Error('User profile not found');
        
        const { data: existing } = await supabase
          .from('donation_bookings')
          .select('id, food_type, estimated_servings, special_notes')
          .eq('donation_slot_id', slotId)
          .eq('donor_id', userProfile.id)
          .single();
          
        if (existing) {
          existingBooking = existing;
          // Show confirmation dialog for updating existing booking
          const confirmUpdate = confirm(
            `This user already has a booking for this slot:\n\n` +
            `Current booking:\n` +
            `• Food: ${existing.food_type}\n` +
            `• Servings: ${existing.estimated_servings}\n` +
            `• Notes: ${existing.special_notes || 'None'}\n\n` +
            `New booking:\n` +
            `• Food: ${bookingFormData.food_type}\n` +
            `• Servings: ${bookingFormData.estimated_servings}\n` +
            `• Notes: ${bookingFormData.special_notes || 'None'}\n\n` +
            `Do you want to update the existing booking with the new values?`
          );
          
          if (!confirmUpdate) {
            setCreatingBooking(false);
            return;
          }
          
          // Update existing booking
          const { error: updateError } = await supabase
            .from('donation_bookings')
            .update({
              food_type: bookingFormData.food_type,
              estimated_servings: bookingFormData.estimated_servings,
              special_notes: bookingFormData.special_notes,
              contact_phone: bookingFormData.donor_phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
            
          if (updateError) throw updateError;
        } else {
          // Create new booking for registered user
          const result = await supabase
            .from('donation_bookings')
            .insert({
              donation_slot_id: slotId,
              donor_id: userProfile.id,
              food_type: bookingFormData.food_type,
              estimated_servings: bookingFormData.estimated_servings,
              special_notes: bookingFormData.special_notes,
              contact_phone: bookingFormData.donor_phone,
              donation_date: format(selectedDate, 'yyyy-MM-dd'),
              status: 'monastery_approved', // Auto-approved for monastery admin bookings
              monastery_approved_at: new Date().toISOString(),
              monastery_approved_by: userId,
              monks_to_feed: 1,
              initiated_by: 'monastery_admin',
              initiated_by_admin_id: userId
            });
            
          if (result.error) throw result.error;
        }
      } else {
        // Guest user - check for duplicate guest booking first
        if (guestId) {
          const { data: existingGuestBooking } = await supabase
            .from('guest_bookings')
            .select('id, food_type, estimated_servings, special_notes')
            .eq('donation_slot_id', slotId)
            .eq('guest_profile_id', guestId)
            .single();
            
          if (existingGuestBooking) {
            // Show confirmation dialog for updating existing guest booking
            const confirmUpdate = confirm(
              `This guest already has a booking for this slot:\n\n` +
              `Current booking:\n` +
              `• Food: ${existingGuestBooking.food_type}\n` +
              `• Servings: ${existingGuestBooking.estimated_servings}\n` +
              `• Notes: ${existingGuestBooking.special_notes || 'None'}\n\n` +
              `New booking:\n` +
              `• Food: ${bookingFormData.food_type}\n` +
              `• Servings: ${bookingFormData.estimated_servings}\n` +
              `• Notes: ${bookingFormData.special_notes || 'None'}\n\n` +
              `Do you want to update the existing booking with the new values?`
            );
            
            if (!confirmUpdate) {
              setCreatingBooking(false);
              return;
            }
            
            // Update existing guest booking
            const { error: updateError } = await supabase
              .from('guest_bookings')
              .update({
                food_type: bookingFormData.food_type,
                estimated_servings: bookingFormData.estimated_servings,
                special_notes: bookingFormData.special_notes,
                contact_phone: bookingFormData.donor_phone,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingGuestBooking.id);
              
            if (updateError) throw updateError;
          } else {
            // Create new guest booking
            const { error: insertError } = await supabase
              .from('guest_bookings')
              .insert({
                donation_slot_id: slotId,
                guest_profile_id: guestId,
                food_type: bookingFormData.food_type,
                estimated_servings: bookingFormData.estimated_servings,
                special_notes: bookingFormData.special_notes,
                contact_phone: bookingFormData.donor_phone,
                status: 'monastery_approved', // Auto-approved for monastery admin bookings
                confirmed_at: new Date().toISOString()
              });
              
            if (insertError) throw insertError;
          }
        }
      }

      // Reset form and close dialog
      setBookingDialogOpen(false)
      setBookingFormData({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        food_type: '',
        estimated_servings: 1,
        special_notes: '',
        selected_slot_id: '',
        selected_time: ''
      })
      setPhoneLookup({
        loading: false,
        found: false,
        error: '',
        isGuest: false
      })

      // Store the selected date for restoration
      if (selectedDate) {
        const restoreData = {
          selectedDate: selectedDate.toISOString(),
          monasteryId: monasteryId,
          timestamp: new Date().toISOString()
        }
        sessionStorage.setItem('guestBookingPreselection', JSON.stringify(restoreData))
      }

      // Refresh slots and bookings
      fetchSlotsForDate(selectedDate)
      
      // Notify parent component to refresh booking data
      if (onBookingCreated) {
        onBookingCreated()
      }
      
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setCreatingBooking(false)
    }
  }

  const openBookingDialog = (preselectedSlot?: DonationSlot) => {
    if (!selectedDate) return
    
    // Reset form and phone lookup state, pre-fill slot if provided
    setBookingFormData({
      donor_name: '',
      donor_email: '',
      donor_phone: '',
      food_type: '',
      estimated_servings: 1,
      special_notes: '',
      selected_slot_id: preselectedSlot?.id || '',
      selected_time: preselectedSlot ? `${preselectedSlot.meal_type} - ${preselectedSlot.time_slot}` : ''
    })
    
    setPhoneLookup({
      loading: false,
      found: false,
      error: '',
      isGuest: false
    })
    
    setBookingDialogOpen(true)
  }

  const availableSlotsForBooking = getAvailableSlotsForBooking()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card className="shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-to-br from-white to-amber-50/20 rounded-2xl border border-amber-100/50 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                {tCalendar('calendarView')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 border-amber-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 border-amber-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-700 py-3 bg-gray-50 rounded-t-lg">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayBookings = bookingsByDate[dateKey] || []
                const totalBookings = dayBookings.length
                
                // Check if we have slots for this date
                const dateSlots = donationSlots.filter(slot => slot.date === dateKey)
                const hasSlots = dateSlots.length > 0
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      'relative p-2 text-center rounded-xl transition-all duration-300 flex flex-col min-h-[70px] border',
                      'hover:shadow-elegant focus:outline-none focus:ring-2 focus:ring-amber-500 hover:scale-105',
                      !isCurrentMonth && 'text-gray-400 bg-gray-50/50',
                      isSelected && 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-elegant scale-105',
                      isToday && !isSelected && 'ring-2 ring-amber-500 ring-offset-2',
                      !isSelected && !isToday && isCurrentMonth && hasSlots && 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:from-green-100 hover:to-emerald-100 hover:border-green-400',
                      !isSelected && !isToday && isCurrentMonth && !hasSlots && 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100',
                      totalBookings > 0 && !isSelected && 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:border-amber-400'
                    )}
                  >
                    <div className={cn(
                      "text-lg font-semibold mb-1",
                      isToday && !isSelected && "text-amber-600"
                    )}>{format(day, 'd')}</div>

                    {totalBookings > 0 && (
                      <div className="w-full px-1 mt-auto">
                        <div className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-white" : "text-gray-700"
                        )}>
                          {totalBookings} {totalBookings === 1 ? tCalendar('booking') : tCalendar('bookings')}
                        </div>
                      </div>
                    )}

                    {hasSlots && (
                      <div className="mt-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full mx-auto",
                          isSelected ? "bg-white" : "bg-green-500"
                        )}></div>
                      </div>
                    )}

                    {isToday && !isSelected && (
                      <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                        {tCalendar('today')}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Section */}
        {selectedDate && (
          <Card className="mt-6 shadow-xl bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">
                {tCalendar('bookingsFor', { date: format(selectedDate, 'MMMM d, yyyy') })}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {tCalendar('bookingsScheduled', {
                  count: bookings.filter(booking =>
                    booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
                  ).length
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.filter(booking => 
                booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{tCalendar('noBookingsForDate')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(booking => 
                    booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
                  ).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-amber-200 transition-all group bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-lg text-gray-900">{booking.user_profiles.full_name}</div>
                            <Badge className={cn(
                              'font-medium',
                              booking.status === 'pending' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                              booking.status === 'monastery_approved' && 'bg-blue-100 text-blue-800 border-blue-200',
                              booking.status === 'confirmed' && 'bg-green-100 text-green-800 border-green-200',
                              booking.status === 'delivered' && 'bg-emerald-100 text-emerald-800 border-emerald-200',
                              booking.status === 'not_delivered' && 'bg-orange-100 text-orange-800 border-orange-200',
                              booking.status === 'cancelled' && 'bg-red-100 text-red-800 border-red-200'
                            )}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div><strong>{tCalendar('food')}</strong> {booking.food_type} ({booking.estimated_servings} {tCalendar('servings')})</div>
                            <div><strong>{tCalendar('time')}</strong> {booking.donation_slots.time}</div>
                            <div><strong>{tCalendar('contact')}</strong> {booking.user_profiles.email}</div>
                            {booking.user_profiles.phone && (
                              <div><strong>{tCalendar('phone')}</strong> {booking.user_profiles.phone}</div>
                            )}
                            {booking.special_notes && (
                              <div><strong>{tCalendar('notes')}</strong> {booking.special_notes}</div>
                            )}
                            <div><strong>{tCalendar('booked')}</strong> {format(parseISO(booking.created_at), 'MMM d, yyyy at h:mm a')}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md"
                              onClick={() => onBookingAction?.(booking.id, 'approve')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {tCalendar('accept')}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md"
                              onClick={() => onBookingAction?.(booking.id, 'cancel')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              {tCalendar('reject')}
                            </Button>
                          </>
                        )}
                        
                        {(booking.status === 'monastery_approved' || booking.status === 'confirmed') && (
                          <>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow-md"
                              onClick={() => onBookingAction?.(booking.id, 'markDelivered')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {tCalendar('markReceived')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-lg"
                              onClick={() => onBookingAction?.(booking.id, 'cancel')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              {tCalendar('cancel')}
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'delivered' && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            <Check className="w-4 h-4 mr-1" />
                            {tCalendar('completed')}
                          </Badge>
                        )}
                        
                        {booking.status === 'not_delivered' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <X className="w-4 h-4 mr-1" />
                            {tCalendar('notReceived')}
                          </Badge>
                        )}
                        
                        {booking.status === 'cancelled' && (
                          <Badge className="bg-red-100 text-red-800">
                            <X className="w-4 h-4 mr-1" />
                            {tCommon('cancel')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Slots Section */}
      <div className="lg:col-span-1">
        {selectedDate && (
          <Card className="shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-2xl border border-amber-100/50">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900">
                {tCalendar('slotsFor', { date: format(selectedDate, 'MMM d') })}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {tCalendar('manageSlots')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Bulk Slot Creation */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setBulkSlotDialogOpen(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-elegant hover:shadow-elegant-lg hover:scale-105 transition-all duration-300"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {tCalendar('createBulk')}
                  </Button>
                </div>

                {/* Meal Type Quick Buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => {
                      setFormData({
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        meal_type: 'breakfast',
                        time_slot: '07:00',
                        monks_capacity: monastery?.capacity || 10,
                        max_donors: 5,
                        booking_notes: ''
                      })
                      setCreateSlotDialogOpen(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    {tCalendar('breakfast', { time: '7:00 AM' })}
                  </Button>

                  <Button
                    onClick={() => {
                      setFormData({
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        meal_type: 'lunch',
                        time_slot: '11:30',
                        monks_capacity: monastery?.capacity || 10,
                        max_donors: 5,
                        booking_notes: ''
                      })
                      setCreateSlotDialogOpen(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    {tCalendar('lunch', { time: '11:30 AM' })}
                  </Button>

                  <Button
                    onClick={() => {
                      setFormData({
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        meal_type: 'dinner',
                        time_slot: '17:00',
                        monks_capacity: monastery?.capacity || 10,
                        max_donors: 5,
                        booking_notes: ''
                      })
                      setCreateSlotDialogOpen(true)
                    }}
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 rounded-lg"
                  >
                    {tCalendar('dinner', { time: '5:00 PM' })}
                  </Button>
                </div>

                {/* Instructions for slot booking */}
                <div className="text-center py-2 px-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium">
                    {tCalendar('clickSlotInstructions')}
                  </p>
                </div>

                {/* Existing Slots */}
                {loadingSlots ? (
                  <div className="text-center py-4">{tCalendar('loadingSlots')}</div>
                ) : donationSlots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium mb-2">{tCalendar('noSlotsForDate')}</p>
                    <p className="text-xs text-gray-400">{tCalendar('createSlotsMessage')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {donationSlots.map((slot) => (
                      <div key={slot.id} className="relative group">
                        {/* Interactive Overlay with Management Actions */}
                        <div className="absolute inset-0 bg-gray-900/90 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex flex-col items-center justify-center">
                          {slot.is_available ? (
                            <>
                              {/* Create Booking Action */}
                              <button
                                onClick={() => openBookingDialog(slot)}
                                className="text-white hover:bg-white/10 rounded-lg p-3 transition-colors w-full"
                              >
                                <UserPlus className="w-6 h-6 mx-auto mb-1" />
                                <p className="font-medium text-sm">{tCalendar('createBooking')}</p>
                              </button>
                              
                              {/* Management Actions Row */}
                              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                                <button
                                  onClick={() => startEditingSlot(slot)}
                                  className="text-gray-300 hover:text-white p-2 hover:bg-white/10 rounded transition-all"
                                  title={tCalendar('editSlot')}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                                  className="text-gray-300 hover:text-yellow-400 p-2 hover:bg-white/10 rounded transition-all"
                                  title={tCalendar('disableSlot')}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                                
                                {slot.current_bookings === 0 && (
                                  <button
                                    onClick={() => deleteSlot(slot.id)}
                                    className="text-gray-300 hover:text-red-400 p-2 hover:bg-white/10 rounded transition-all"
                                    title="Delete Slot"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-white text-center">
                              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                              <p className="font-medium">{tCalendar('slotDisabled')}</p>
                              <button
                                onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                                className="mt-3 text-sm px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                              >
                                {tCalendar('enableSlot')}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className={cn(
                          "border rounded-xl p-3 transition-all duration-200 bg-white",
                          slot.is_available
                            ? "border-gray-200 group-hover:border-amber-300 group-hover:shadow-lg cursor-pointer"
                            : "opacity-60 border-gray-200"
                        )}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-sm capitalize text-gray-900">
                            {slot.meal_type} - {slot.time_slot}
                          </div>
                          <Badge
                            className={cn(
                              'font-medium',
                              slot.is_available ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                            )}
                          >
                            {slot.is_available ? tCalendar('active') : tCalendar('disabled')}
                          </Badge>
                        </div>
                        
                        <div className="text-xs mb-2">
                          <div className={cn(
                            "font-medium",
                            slot.monks_fed > slot.monks_capacity 
                              ? "text-red-600" 
                              : slot.monks_fed === slot.monks_capacity 
                              ? "text-yellow-600" 
                              : "text-gray-600"
                          )}>
                            <span className="font-semibold">{slot.monks_fed}</span>/{slot.monks_capacity} {tCalendar('servings')}
                            {slot.monks_fed > slot.monks_capacity && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                {tCalendar('overCapacity')}
                              </span>
                            )}
                            {slot.monks_fed === slot.monks_capacity && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                {tCalendar('full')}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 mt-1">
                            {slot.current_bookings} {slot.current_bookings === 1 ? tCalendar('booking') : tCalendar('bookings')}
                          </div>
                          
                          {/* Capacity Progress Bar */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  slot.monks_fed > slot.monks_capacity 
                                    ? "bg-red-500" 
                                    : slot.monks_fed === slot.monks_capacity 
                                    ? "bg-yellow-500" 
                                    : "bg-green-500"
                                )}
                                style={{ 
                                  width: `${Math.min((slot.monks_fed / slot.monks_capacity) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedDate && (
          <Card className="shadow-xl bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{tCalendar('selectDate')}</CardTitle>
              <CardDescription className="text-gray-600">
                {tCalendar('chooseDateMessage')}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Create Slot Dialog */}
      <Dialog open={createSlotDialogOpen} onOpenChange={setCreateSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tSlot('createNewSlot')}</DialogTitle>
            <DialogDescription>
              {tSlot('addSlotFor', { date: selectedDate && format(selectedDate, 'MMMM d, yyyy') })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>{tSlot('mealType')}</Label>
              <Select 
                value={formData.meal_type} 
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    meal_type: value as 'breakfast' | 'lunch' | 'dinner',
                    time_slot: getDefaultTime(value)
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">{tSlot('breakfast')}</SelectItem>
                  <SelectItem value="lunch">{tSlot('lunch')}</SelectItem>
                  <SelectItem value="dinner">{tSlot('dinner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time_slot}
                onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monks Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.monks_capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, monks_capacity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Max Donors</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_donors}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_donors: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Notes for Donors</Label>
              <Textarea
                value={formData.booking_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_notes: e.target.value }))}
                placeholder="Important notes that donors should see..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSlotDialogOpen(false)} className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg">
              Cancel
            </Button>
            <Button onClick={createSlot} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md">
              Create Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={editSlotDialogOpen} onOpenChange={setEditSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
            <DialogDescription>
              Update slot details for {selectedSlot?.date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time_slot}
                onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monks Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.monks_capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, monks_capacity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Max Donors</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_donors}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_donors: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.booking_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlotDialogOpen(false)} className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg">
              Cancel
            </Button>
            <Button onClick={updateSlot} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md">
              Update Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Slot Dialog */}
      <Dialog open={bulkSlotDialogOpen} onOpenChange={setBulkSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bulk Slots</DialogTitle>
            <DialogDescription>
              Create slots for 30 weekdays starting from {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Default Monks Capacity</Label>
              <Input
                type="number"
                min="1"
                value={formData.monks_capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, monks_capacity: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Default Max Donors</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.max_donors}
                onChange={(e) => setFormData(prev => ({ ...prev, max_donors: parseInt(e.target.value) }))}
              />
            </div>
            <p className="text-sm text-gray-600">
              This will create breakfast (7:00 AM), lunch (11:30 AM), and dinner (5:00 PM) slots for the next 30 weekdays.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSlotDialogOpen(false)} className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg">
              Cancel
            </Button>
            <Button onClick={createBulkSlots} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg shadow-md">
              Create {30 * 3} Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Add a new donation booking for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Phone Number Lookup - First Field */}
            <div className="space-y-2">
              <Label>Donor Phone *</Label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={bookingFormData.donor_phone}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, donor_phone: e.target.value }))}
                  onBlur={() => handlePhoneLookup()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePhoneLookup();
                    }
                  }}
                  placeholder="Enter phone number to auto-fill details"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePhoneLookup}
                  disabled={!bookingFormData.donor_phone || phoneLookup.loading}
                >
                  {phoneLookup.loading ? 'Searching...' : 'Lookup'}
                </Button>
              </div>
              {phoneLookup.error && (
                <p className="text-sm text-red-600">{phoneLookup.error}</p>
              )}
              {phoneLookup.found && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  ✓ Donor found
                </Badge>
              )}
            </div>

            {/* Donor Name */}
            <div className="space-y-2">
              <Label>Donor Name *</Label>
              <Input
                value={bookingFormData.donor_name}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                placeholder="Enter donor name"
                required
              />
            </div>

            {/* Donor Email */}
            <div className="space-y-2">
              <Label>Donor Email *</Label>
              <Input
                type="email"
                value={bookingFormData.donor_email}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, donor_email: e.target.value }))}
                placeholder="Enter donor email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Food Type *</Label>
              <Input
                value={bookingFormData.food_type}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, food_type: e.target.value }))}
                placeholder="e.g., Rice and curry, Vegetables, Fruits"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Servings *</Label>
              <Input
                type="number"
                min="1"
                value={bookingFormData.estimated_servings}
                onChange={(e) => setBookingFormData(prev => ({ 
                  ...prev, 
                  estimated_servings: Math.max(1, parseInt(e.target.value) || 1) 
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select 
                value={bookingFormData.selected_slot_id}
                onValueChange={(value) => {
                  const slot = availableSlotsForBooking.find(s => s.id === value)
                  setBookingFormData(prev => ({ 
                    ...prev, 
                    selected_slot_id: value,
                    selected_time: slot?.time_slot || ''
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot or enter custom time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlotsForBooking.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.meal_type.charAt(0).toUpperCase() + slot.meal_type.slice(1)} - {slot.time_slot}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bookingFormData.selected_slot_id === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Time *</Label>
                <Input
                  type="time"
                  value={bookingFormData.selected_time}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, selected_time: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Special Notes</Label>
              <Textarea
                value={bookingFormData.special_notes}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, special_notes: e.target.value }))}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
              disabled={creatingBooking}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={createBooking}
              disabled={creatingBooking || !bookingFormData.donor_name || !bookingFormData.donor_email || !bookingFormData.food_type}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md"
            >
              {creatingBooking ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}