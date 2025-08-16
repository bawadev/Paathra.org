'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isAfter, isBefore, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Utensils, AlertCircle, Phone, Mail, MapPin, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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
  delivery_notes?: string
  monasteries?: {
    capacity: number
  }
}

interface CalendarBookingViewProps {
  monasteryId: string
  bookings: Booking[]
  onBookingAction?: (bookingId: string, action: string) => void
}

export function CalendarBookingView({ monasteryId, bookings, onBookingAction }: CalendarBookingViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarBookings, setCalendarBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = format(parseISO(booking.donation_slots.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  // Calculate capacity usage for each date
  const getCapacityInfo = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayBookings = bookingsByDate[dateKey] || []
    
    // Get monastery capacity from the first booking's monastery data
    const monasteryCapacity = bookings.length > 0 && bookings[0]?.monasteries?.capacity
      ? bookings[0].monasteries.capacity
      : 50
    
    // Group bookings by time slot to calculate per-slot capacity
    const slotCapacities = dayBookings.reduce((acc, booking) => {
      const slotTime = booking.donation_slots.time
      const slotCapacity = booking.donation_slots.capacity || monasteryCapacity
      
      if (!acc[slotTime]) {
        acc[slotTime] = {
          capacity: slotCapacity,
          totalBooked: 0,
          approvedBooked: 0,
          unapprovedBooked: 0,
          bookings: []
        }
      }
      
      acc[slotTime].totalBooked += booking.estimated_servings
      acc[slotTime].bookings.push(booking)
      
      if (booking.status === 'confirmed' || booking.status === 'monastery_approved' || booking.status === 'delivered') {
        acc[slotTime].approvedBooked += booking.estimated_servings
      } else if (booking.status === 'pending') {
        acc[slotTime].unapprovedBooked += booking.estimated_servings
      }
      
      return acc
    }, {} as Record<string, { capacity: number; totalBooked: number; approvedBooked: number; unapprovedBooked: number; bookings: Booking[] }>)
    
    // Calculate totals across all slots for the day
    const totalBooked = Object.values(slotCapacities).reduce((sum, slot) => sum + slot.totalBooked, 0)
    const approvedBooked = Object.values(slotCapacities).reduce((sum, slot) => sum + slot.approvedBooked, 0)
    const unapprovedBooked = Object.values(slotCapacities).reduce((sum, slot) => sum + slot.unapprovedBooked, 0)
    
    // For display purposes, use the maximum capacity across all slots or monastery capacity
    const maxSlotCapacity = Object.values(slotCapacities).reduce((max, slot) => Math.max(max, slot.capacity), 0)
    const displayCapacity = Math.max(maxSlotCapacity, monasteryCapacity)

    return {
      totalBooked,
      approvedBooked,
      unapprovedBooked,
      slots: slotCapacities,
      dayBookings,
      totalCapacity: displayCapacity
    }
  }

  // Get the actual bookings for selected date or upcoming bookings
  const getDisplayBookings = () => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      return bookingsByDate[dateKey] || []
    } else {
      // Show upcoming bookings
      const today = new Date()
      return bookings
        .filter(booking => isAfter(parseISO(booking.donation_slots.date), today) || 
                         (isSameDay(parseISO(booking.donation_slots.date), today) && 
          booking.status !== 'delivered' && booking.status !== 'not_delivered'))
        .sort((a, b) => {
          const dateA = parseISO(a.donation_slots.date)
          const dateB = parseISO(b.donation_slots.date)
          if (!isSameDay(dateA, dateB)) {
            return dateA.getTime() - dateB.getTime()
          }
          const timeA = a.donation_slots.time || ''
          const timeB = b.donation_slots.time || ''
          return timeA.localeCompare(timeB)
        })
    }
  }

  const displayBookings = getDisplayBookings()

  // Group bookings by slot time
  const groupBookingsBySlot = (bookings: Booking[]) => {
    return bookings.reduce((acc, booking) => {
      const slotTime = booking.donation_slots.time
      if (!acc[slotTime]) {
        acc[slotTime] = []
      }
      acc[slotTime].push(booking)
      return acc
    }, {} as Record<string, Booking[]>)
  }

  const groupedBookings = groupBookingsBySlot(displayBookings)

  // Get capacity color indicator
  const getCapacityColor = (date: Date) => {
    const { totalBooked, totalCapacity } = getCapacityInfo(date)
    if (totalBooked === 0) return ''
    const percentage = (totalBooked / totalCapacity) * 100
    if (percentage <= 20) return 'bg-green-100 text-green-800'
    if (percentage <= 50) return 'bg-yellow-100 text-yellow-800'
    if (percentage <= 80) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const handleBookingAction = (bookingId: string, action: string) => {
    if (onBookingAction) {
      const normalizedAction = action === 'decline' ? 'cancel' : action
      onBookingAction(bookingId, normalizedAction)
    }
    setIsDialogOpen(false)
  }

  const formatTimeSlot = (time: string) => {
    // Handle undefined or null time
    if (!time) {
      return 'No time specified'
    }
    
    // Handle HH:MM format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const amPm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${amPm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monastery_approved':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'not_delivered':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'monastery_approved':
      case 'confirmed':
      case 'delivered':
        return '✓'
      case 'pending':
        return '⏳'
      case 'cancelled':
      case 'not_delivered':
        return '✗'
      default:
        return '?'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3">
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
              const { totalBooked, approvedBooked, unapprovedBooked, totalCapacity } = getCapacityInfo(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative p-2 text-center rounded-lg transition-all duration-200 flex flex-col min-h-[70px] border-2',
                    !isCurrentMonth && 'text-gray-400 opacity-50',
                    isSelected && 'bg-blue-100 text-blue-900 border-blue-500 shadow-md scale-105',
                    isToday && !isSelected && 'bg-blue-50 border-blue-300 font-semibold',
                    !isSelected && !isToday && isCurrentMonth && 'border-gray-200 hover:border-gray-400 hover:shadow-sm hover:scale-105',
                    'hover:border-gray-400 hover:shadow-sm active:scale-95'
                  )}
                >
                  <div className={cn(
                    "text-sm font-semibold mb-1",
                    isToday && "text-blue-600"
                  )}>{format(day, 'd')}</div>
                  {totalBooked > 0 ? (
                    <div className="w-full px-1 mt-auto">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1 shadow-inner">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          {approvedBooked > 0 && (
                            <div
                              className="bg-blue-500 h-2 transition-all duration-300"
                              style={{ width: `${Math.min((approvedBooked / totalCapacity) * 100, 100)}%` }}
                            />
                          )}
                          {unapprovedBooked > 0 && (
                            <div
                              className="bg-orange-500 h-2 transition-all duration-300"
                              style={{ width: `${Math.min((unapprovedBooked / totalCapacity) * 100, 100 - (approvedBooked / totalCapacity) * 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {totalBooked}/{totalCapacity}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-1 mt-auto">
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1 shadow-inner">
                        <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }} />
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        0/{totalCapacity}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-200">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-blue-700">Confirmed</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-orange-50 border border-orange-200">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-orange-700">Pending</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
              <div className="w-2.5 h-2.5 bg-gray-300 rounded-full shadow-sm"></div>
              <span className="font-medium text-gray-700">Empty</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            {selectedDate 
              ? `Bookings for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Upcoming Bookings'
            }
          </CardTitle>
          <CardDescription>
            {selectedDate 
              ? `${displayBookings.length} booking(s) scheduled`
              : `Next ${displayBookings.length} upcoming bookings`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings found</p>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="mt-2"
                >
                  Show upcoming bookings
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedBookings).map(([timeSlot, slotBookings]) => (
                <div key={timeSlot} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTimeSlot(timeSlot)}
                    </h4>
                    <Badge variant="outline">
                      {slotBookings.length} booking{slotBookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {slotBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="border-l-4 border-gray-200 pl-3 hover:bg-gray-50 p-2 rounded group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{booking.user_profiles.full_name}</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)} {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Utensils className="w-3 h-3 mr-2" />
                            {booking.food_type} ({booking.estimated_servings} servings)
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2" />
                            {format(parseISO(booking.donation_slots.date), 'MMM d')}
                          </div>
                          {booking.special_notes && (
                            <div className="flex items-start">
                              <AlertCircle className="w-3 h-3 mr-2 mt-0.5" />
                              <span className="text-xs">{booking.special_notes}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick action buttons for pending bookings */}
                        {booking.status === 'pending' && (
                          <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingAction(booking.id, 'approve')
                              }}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookingAction(booking.id, 'decline')
                              }}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                        
                        {/* View details button for all bookings */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookingClick(booking)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  Review and manage this donation booking
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Donator Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Donator Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedBooking.user_profiles.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedBooking.user_profiles.email}</span>
                    </div>
                    {selectedBooking.user_profiles.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedBooking.user_profiles.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Booking Date:</span>
                      <span>{format(parseISO(selectedBooking.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Donation Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    Donation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Date & Time:</span>
                      <span>
                        {format(parseISO(selectedBooking.donation_slots.date), 'MMM d, yyyy')} at {formatTimeSlot(selectedBooking.donation_slots.time)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Food Type:</span>
                      <span>{selectedBooking.food_type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Servings:</span>
                      <span>{selectedBooking.estimated_servings}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {getStatusIcon(selectedBooking.status)} {selectedBooking.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedBooking.special_notes && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <span className="font-medium">Special Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{selectedBooking.special_notes}</p>
                    </div>
                  )}
                  
                  {selectedBooking.delivery_notes && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <span className="font-medium">Delivery Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{selectedBooking.delivery_notes}</p>
                    </div>
                  )}
                  
                  {selectedBooking.donation_slots.special_requirements && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <span className="font-medium text-yellow-800">Special Requirements:</span>
                      <p className="text-sm text-yellow-700 mt-1">{selectedBooking.donation_slots.special_requirements}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleBookingAction(selectedBooking.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleBookingAction(selectedBooking.id, 'decline')}
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'monastery_approved') && (
                    <Button
                      onClick={() => handleBookingAction(selectedBooking.id, 'mark_delivered')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}