'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isAfter, isBefore, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Utensils, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    
    const totalBooked = dayBookings.reduce((sum, booking) => sum + booking.estimated_servings, 0)
    const slots = dayBookings.reduce((acc, booking) => {
      const slotTime = booking.donation_slots.time
      if (!acc[slotTime]) {
        acc[slotTime] = {
          total: 0,
          bookings: []
        }
      }
      acc[slotTime].total += booking.estimated_servings
      acc[slotTime].bookings.push(booking)
      return acc
    }, {} as Record<string, { total: number; bookings: Booking[] }>)

    return { totalBooked, slots, dayBookings }
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
          return a.donation_slots.time.localeCompare(b.donation_slots.time)
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
    const { totalBooked } = getCapacityInfo(date)
    if (totalBooked === 0) return ''
    if (totalBooked <= 20) return 'bg-green-100 text-green-800'
    if (totalBooked <= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const formatTimeSlot = (time: string) => {
    // Handle HH:MM format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
              const dayBookings = bookingsByDate[dateKey] || []
              const { totalBooked } = getCapacityInfo(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative p-2 text-center rounded-lg transition-colors',
                    !isCurrentMonth && 'text-gray-400',
                    isSelected && 'bg-blue-100 text-blue-900 ring-2 ring-blue-500',
                    isToday && !isSelected && 'bg-gray-100',
                    'hover:bg-gray-100'
                  )}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  {totalBooked > 0 && (
                    <div className={cn(
                      'absolute bottom-1 left-1 right-1 text-xs rounded-full px-1 py-0.5',
                      getCapacityColor(day)
                    )}>
                      {totalBooked}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-100 rounded-full"></div>
              <span>Low (1-20)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-100 rounded-full"></div>
              <span>Medium (21-50)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-100 rounded-full"></div>
              <span>High (51+)</span>
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
                      <div key={booking.id} className="border-l-4 border-gray-200 pl-3">
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}