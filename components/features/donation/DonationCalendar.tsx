'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { DonationSlot } from '@/lib/types'

interface DonationCalendarProps {
  onSlotSelect: (slot: DonationSlot) => void
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  monasteryId?: string
  className?: string
}

export function DonationCalendar({ 
  onSlotSelect, 
  selectedDate: externalSelectedDate,
  onDateSelect,
  monasteryId,
  className 
}: DonationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)

  const selectedDate = externalSelectedDate || internalSelectedDate

  useEffect(() => {
    fetchSlots()
  }, [currentMonth, monasteryId])

  const fetchSlots = async () => {
    setLoading(true)
    const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    
    let query = supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('start_time')

    if (monasteryId) {
      query = query.eq('monastery_id', monasteryId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching slots:', error)
    } else {
      setSlots(data || [])
    }
    setLoading(false)
  }

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])
  const calendarDays = useMemo(() => 
    eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  )

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, DonationSlot[]> = {}
    slots.forEach(slot => {
      const dateKey = slot.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    return grouped
  }, [slots])

  const handleDateSelect = useCallback((date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    } else {
      setInternalSelectedDate(date)
    }
    setSelectedSlot(null)
  }, [onDateSelect])

  const handleSlotSelect = useCallback((slot: DonationSlot) => {
    setSelectedSlot(slot)
    onSlotSelect(slot)
  }, [onSlotSelect])

  const getDateStatus = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const daySlots = slotsByDate[dateKey] || []
    
    if (daySlots.length === 0) return 'unavailable'
    
    const hasAvailableSlots = daySlots.some(slot => 
      slot.is_available && slot.current_bookings < slot.capacity
    )
    
    return hasAvailableSlots ? 'available' : 'full'
  }, [slotsByDate])

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }, [])

  const selectedDateSlots = selectedDate ? (slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []) : []

  return (
    <div className={cn('space-y-6', className)}>
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Donation Calendar
              </CardTitle>
              <CardDescription>
                Select a date to view available donation slots
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {calendarDays.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const status = getDateStatus(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isTodayDate = isToday(date)
              
              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isCurrentMonth || status === 'unavailable'}
                  className={cn(
                    'relative p-2 text-sm rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary',
                    {
                      'text-gray-400': !isCurrentMonth,
                      'bg-primary text-white': isSelected,
                      'ring-2 ring-primary': isTodayDate && !isSelected,
                      'bg-green-50 text-green-700': status === 'available' && !isSelected,
                      'bg-orange-50 text-orange-700': status === 'full' && !isSelected,
                      'bg-gray-50 text-gray-400 cursor-not-allowed': status === 'unavailable',
                    }
                  )}
                >
                  <span className="relative z-10">{format(date, 'd')}</span>
                  
                  {status !== 'unavailable' && (
                    <div className={cn(
                      'absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full',
                      {
                        'bg-green-500': status === 'available',
                        'bg-orange-500': status === 'full'
                      }
                    )} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Available
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              Limited
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Unavailable
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Available Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading slots...</div>
            ) : selectedDateSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No donation slots available for this date
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSlots.map(slot => (
                  <SlotCard 
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelect={handleSlotSelect}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Memoized Slot Card Component
function SlotCard({ 
  slot, 
  isSelected, 
  onSelect 
}: { 
  slot: DonationSlot
  isSelected: boolean
  onSelect: (slot: DonationSlot) => void
}) {
  const isAvailable = slot.is_available && slot.current_bookings < slot.capacity
  const availableSpots = slot.capacity - slot.current_bookings
  
  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary',
        !isAvailable && 'opacity-60'
      )}
    >
      <CardContent 
        className="cursor-pointer" 
        onClick={() => isAvailable && onSelect(slot)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {slot.start_time} - {slot.end_time}
              </span>
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? `${availableSpots} spots left` : 'Full'}
              </Badge>
            </div>
            
            {slot.monastery && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span>{slot.monastery.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{slot.current_bookings}/{slot.capacity} confirmed donations</span>
            </div>
            
            {slot.requirements && (
              <p className="text-xs text-muted-foreground mt-2">
                Requirements: {slot.requirements}
              </p>
            )}
          </div>
          
          {isAvailable && (
            <Button 
              size="sm"
              variant={isSelected ? "default" : "outline"}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}