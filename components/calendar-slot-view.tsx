'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isAfter, isBefore, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Utensils, AlertCircle, Phone, Mail, MapPin, Check, X, Plus, UserPlus, Edit3, Trash2 } from 'lucide-react'
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
  onBookingAction?: (bookingId: string, action: string) => void
  onCreateGuestBooking?: (date: Date, availableSlots: any[]) => void
}

export function CalendarSlotView({ monasteryId, bookings, onBookingAction, onCreateGuestBooking }: CalendarSlotViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [donationSlots, setDonationSlots] = useState<DonationSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [createSlotDialogOpen, setCreateSlotDialogOpen] = useState(false)
  const [editSlotDialogOpen, setEditSlotDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)
  const [bulkSlotDialogOpen, setBulkSlotDialogOpen] = useState(false)
  const [monastery, setMonastery] = useState<any>(null)

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

  // Fetch slots for selected date
  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate)
    }
  }, [selectedDate])

  const fetchSlotsForDate = async (date: Date) => {
    setLoadingSlots(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const { data: slots } = await supabase
      .from('donation_slots')
      .select('*')
      .eq('monastery_id', monasteryId)
      .eq('date', dateStr)
      .order('time_slot')

    setDonationSlots(slots || [])
    setLoadingSlots(false)
  }

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

  // Get slot occupancy info
  const getSlotOccupancy = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayBookings = bookingsByDate[dateKey] || []
    
    // Count bookings by time slot (actual booking count, not servings)
    const slotBookings = dayBookings.reduce((acc, booking) => {
      const time = booking.donation_slots.time
      if (!acc[time]) acc[time] = 0
      acc[time] += 1 // Count actual bookings, not servings
      return acc
    }, {} as Record<string, number>)

    return slotBookings
  }

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
    if (!selectedDate || !monastery) return

    // Check if slot already exists
    const existingSlot = donationSlots.find(
      slot => slot.meal_type === formData.meal_type && slot.date === formData.date
    )

    if (existingSlot) {
      alert(`A ${formData.meal_type} slot already exists for this date`)
      return
    }

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
        created_by: 'monastery_admin'
      })

    if (!error) {
      setCreateSlotDialogOpen(false)
      fetchSlotsForDate(selectedDate)
      // Update monastery default time if changed
      if (formData.time_slot !== getDefaultTime(formData.meal_type)) {
        const updateField = `${formData.meal_type}_time`
        await supabase
          .from('monasteries')
          .update({ [updateField]: `${formData.time_slot}:00` })
          .eq('id', monasteryId)
      }
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
          created_by: 'monastery_admin'
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

  const createBooking = async () => {
    if (!selectedDate || !monastery) return

    setCreatingBooking(true)

    try {
      // Find or create slot for the selected time
      let slotId = bookingFormData.selected_slot_id
      
      if (!slotId) {
        // Create new slot if none selected
        const { data: newSlot, error: slotError } = await supabase
          .from('donation_slots')
          .insert({
            monastery_id: monasteryId,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time_slot: bookingFormData.selected_time || '12:00',
            meal_type: 'lunch',
            monks_capacity: monastery.capacity || 10,
            max_donors: 5,
            is_available: true,
            monks_fed: 0,
            current_bookings: 0,
            created_by: 'monastery_admin'
          })
          .select()
          .single()

        if (slotError) throw slotError
        slotId = newSlot.id
      }

      // Create the booking
      const { error: bookingError } = await supabase
        .from('donation_bookings')
        .insert({
          donation_slot_id: slotId,
          donor_id: null, // Guest booking
          food_type: bookingFormData.food_type,
          estimated_servings: bookingFormData.estimated_servings,
          special_notes: bookingFormData.special_notes,
          guest_name: bookingFormData.donor_name,
          guest_email: bookingFormData.donor_email,
          guest_phone: bookingFormData.donor_phone,
          status: 'monastery_approved', // Auto-approved for monastery admin bookings
          confirmed_at: new Date().toISOString()
        })

      if (bookingError) throw bookingError

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

      // Refresh slots and bookings
      fetchSlotsForDate(selectedDate)
      
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setCreatingBooking(false)
    }
  }

  const openBookingDialog = () => {
    if (!selectedDate) return
    
    // Reset form with default values
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
    
    setBookingDialogOpen(true)
  }

  const availableSlotsForBooking = getAvailableSlotsForBooking()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar View</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">
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
                      'relative p-2 text-center rounded-lg transition-all duration-200 flex flex-col min-h-[70px] border-2',
                      !isCurrentMonth && 'text-gray-400 opacity-50',
                      isSelected && 'bg-blue-100 text-blue-900 border-blue-500 shadow-md scale-105',
                      isToday && !isSelected && 'bg-blue-50 border-blue-300 font-semibold',
                      !isSelected && !isToday && isCurrentMonth && 'border-gray-200 hover:border-gray-400 hover:shadow-sm',
                      'hover:border-gray-400 hover:shadow-sm active:scale-95'
                    )}
                  >
                    <div className={cn(
                      "text-sm font-semibold mb-1",
                      isToday && "text-blue-600"
                    )}>{format(day, 'd')}</div>
                    
                    {totalBookings > 0 && (
                      <div className="w-full px-1 mt-auto">
                        <div className="text-xs text-gray-700 font-medium">
                          {totalBookings} bookings
                        </div>
                      </div>
                    )}
                    
                    {hasSlots && (
                      <div className="text-xs text-green-600 font-medium">
                        {dateSlots.length} slots
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Section */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Bookings for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {bookings.filter(booking => 
                  booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
                ).length} booking(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.filter(booking => 
                booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(booking => 
                    booking.donation_slots.date === format(selectedDate, 'yyyy-MM-dd')
                  ).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-lg">{booking.user_profiles.full_name}</div>
                            <Badge className={cn(
                              booking.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                              booking.status === 'monastery_approved' && 'bg-blue-100 text-blue-800',
                              booking.status === 'confirmed' && 'bg-green-100 text-green-800',
                              booking.status === 'delivered' && 'bg-emerald-100 text-emerald-800',
                              booking.status === 'not_delivered' && 'bg-orange-100 text-orange-800',
                              booking.status === 'cancelled' && 'bg-red-100 text-red-800'
                            )}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div><strong>Food:</strong> {booking.food_type} ({booking.estimated_servings} servings)</div>
                            <div><strong>Time:</strong> {booking.donation_slots.time}</div>
                            <div><strong>Contact:</strong> {booking.user_profiles.email}</div>
                            {booking.user_profiles.phone && (
                              <div><strong>Phone:</strong> {booking.user_profiles.phone}</div>
                            )}
                            {booking.special_notes && (
                              <div><strong>Notes:</strong> {booking.special_notes}</div>
                            )}
                            <div><strong>Booked:</strong> {format(parseISO(booking.created_at), 'MMM d, yyyy at h:mm a')}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onBookingAction?.(booking.id, 'approve')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onBookingAction?.(booking.id, 'cancel')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {(booking.status === 'monastery_approved' || booking.status === 'confirmed') && (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => onBookingAction?.(booking.id, 'markDelivered')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark Received
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              onClick={() => onBookingAction?.(booking.id, 'cancel')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'delivered' && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            <Check className="w-4 h-4 mr-1" />
                            Completed
                          </Badge>
                        )}
                        
                        {booking.status === 'not_delivered' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <X className="w-4 h-4 mr-1" />
                            Not Received
                          </Badge>
                        )}
                        
                        {booking.status === 'cancelled' && (
                          <Badge className="bg-red-100 text-red-800">
                            <X className="w-4 h-4 mr-1" />
                            Cancelled
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
          <Card>
            <CardHeader>
              <CardTitle>
                Slots for {format(selectedDate, 'MMM d')}
              </CardTitle>
              <CardDescription>
                Manage donation time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Slot Creation */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => setCreateSlotDialogOpen(true)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Slot
                  </Button>
                  
                  <Button 
                    onClick={() => setBulkSlotDialogOpen(true)}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bulk (30 days)
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
                  >
                    Breakfast (7:00 AM)
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
                  >
                    Lunch (11:30 AM)
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
                  >
                    Dinner (5:00 PM)
                  </Button>
                </div>

                {/* Big Green Book Button */}
                <Button 
                  onClick={() => openBookingDialog()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-3 h-auto"
                  size="lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Book Donation
                </Button>

                {/* Existing Slots */}
                {loadingSlots ? (
                  <div className="text-center py-4">Loading slots...</div>
                ) : donationSlots.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No slots for this date</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {donationSlots.map((slot) => (
                      <div key={slot.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm capitalize">
                            {slot.meal_type} - {slot.time_slot}
                          </div>
                          <Badge 
                            className={slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            size="sm"
                          >
                            {slot.is_available ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          {slot.monks_fed}/{slot.monks_capacity} monks • {slot.current_bookings}/{slot.max_donors} donors
                        </div>
                        
                        <div className="flex gap-1">
                          <Button 
                            size="xs" 
                            variant="ghost"
                            onClick={() => startEditingSlot(slot)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost"
                            onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                          >
                            {slot.is_available ? 'Disable' : 'Enable'}
                          </Button>
                          {slot.current_bookings === 0 && (
                            <Button 
                              size="xs" 
                              variant="ghost"
                              onClick={() => deleteSlot(slot.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
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
          <Card>
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
              <CardDescription>
                Choose a date from the calendar to manage slots and view bookings
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Create Slot Dialog */}
      <Dialog open={createSlotDialogOpen} onOpenChange={setCreateSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Slot</DialogTitle>
            <DialogDescription>
              Add a new donation time slot for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Meal Type</Label>
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
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
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
            <Button variant="outline" onClick={() => setCreateSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSlot}>
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
            <Button variant="outline" onClick={() => setEditSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateSlot}>
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
            <Button variant="outline" onClick={() => setBulkSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBulkSlots}>
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
            {/* Donor Information */}
            <div className="space-y-2">
              <Label>Donor Name *</Label>
              <Input
                value={bookingFormData.donor_name}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                placeholder="Enter donor name"
                required
              />
            </div>

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
              <Label>Donor Phone</Label>
              <Input
                type="tel"
                value={bookingFormData.donor_phone}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, donor_phone: e.target.value }))}
                placeholder="Enter donor phone"
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
            >
              Cancel
            </Button>
            <Button 
              onClick={createBooking}
              disabled={creatingBooking || !bookingFormData.donor_name || !bookingFormData.donor_email || !bookingFormData.food_type}
              className="bg-green-600 hover:bg-green-700"
            >
              {creatingBooking ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}