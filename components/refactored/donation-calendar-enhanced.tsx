/**
 * Refactored Donation Calendar Component
 * 
 * This component demonstrates the new refactoring improvements:
 * - Enhanced error handling
 * - Better loading states
 * - Improved component composition
 * - Performance optimizations
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

// Enhanced imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingOverlay, useOperationLoading } from '@/lib/loading-system'
import { useError } from '@/lib/error-management'
import { createMemoizedComponent, usePerformanceMonitor } from '@/lib/performance'
import { cn } from '@/lib/utils'

// Types
interface DonationSlot {
  id: string
  monastery_id: string
  date: string
  start_time: string
  end_time: string
  capacity: number
  current_bookings: number
  is_available: boolean
  requirements?: string
  monastery?: {
    name: string
    location: string
  }
}

interface RefactoredCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onSlotSelect?: (slot: DonationSlot) => void
  monasteryId?: string
  className?: string
}

// Main component
function RefactoredDonationCalendarComponent({
  selectedDate,
  onDateSelect,
  onSlotSelect,
  monasteryId,
  className
}: RefactoredCalendarProps) {
  // Performance monitoring
  usePerformanceMonitor('RefactoredDonationCalendar')

  // State management
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)

  // Enhanced hooks
  const { reportError } = useError()
  const fetchOperation = useOperationLoading('calendar-fetch-slots')

  // Memoized calculations
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])
  const calendarDays = useMemo(() => 
    eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  )

  // Memoized slot grouping
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

  // Fetch slots for current month
  const fetchSlots = useCallback(async () => {
    await fetchOperation.executeWithLoading(async () => {
      try {
        // Simulate API call - replace with actual Supabase call
        const response = await fetch(`/api/donation-slots?month=${format(currentMonth, 'yyyy-MM')}&monastery=${monasteryId || ''}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch slots: ${response.statusText}`)
        }

        const data = await response.json()
        setSlots(data.slots || [])
      } catch (error: any) {
        reportError(error, {
          component: 'RefactoredDonationCalendar',
          action: 'fetchSlots',
          month: format(currentMonth, 'yyyy-MM'),
          monasteryId
        })
        throw error
      }
    }, `Loading slots for ${format(currentMonth, 'MMMM yyyy')}`)
  }, [currentMonth, monasteryId, fetchOperation, reportError])

  // Load slots when month changes
  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }, [])

  // Date selection handler
  const handleDateSelect = useCallback((date: Date) => {
    onDateSelect?.(date)
    
    // Find slots for selected date
    const dateKey = format(date, 'yyyy-MM-dd')
    const daySlots = slotsByDate[dateKey] || []
    
    if (daySlots.length === 1) {
      setSelectedSlot(daySlots[0])
      onSlotSelect?.(daySlots[0])
    } else {
      setSelectedSlot(null)
    }
  }, [onDateSelect, onSlotSelect, slotsByDate])

  // Slot selection handler
  const handleSlotSelect = useCallback((slot: DonationSlot) => {
    setSelectedSlot(slot)
    onSlotSelect?.(slot)
  }, [onSlotSelect])

  // Get availability status for a date
  const getDateStatus = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const daySlots = slotsByDate[dateKey] || []
    
    if (daySlots.length === 0) return 'unavailable'
    
    const hasAvailableSlots = daySlots.some(slot => 
      slot.is_available && slot.current_bookings < slot.capacity
    )
    
    return hasAvailableSlots ? 'available' : 'full'
  }, [slotsByDate])

  return (
    <div className={cn('space-y-6', className)} data-testid="donation-calendar">
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
                data-testid="previous-month"
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
                data-testid="next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <LoadingOverlay isLoading={fetchOperation.isLoading} message="Loading calendar...">
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
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
                    data-testid={`calendar-day-${dateKey}`}
                    data-date={dateKey}
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
                    
                    {/* Availability indicator */}
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
        </LoadingOverlay>
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
            {(() => {
              const dateKey = format(selectedDate, 'yyyy-MM-dd')
              const daySlots = slotsByDate[dateKey] || []
              
              if (daySlots.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    No donation slots available for this date
                  </div>
                )
              }

              return (
                <div className="space-y-3">
                  {daySlots.map(slot => (
                    <SlotCard 
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onSelect={handleSlotSelect}
                    />
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Memoized Slot Card Component
const SlotCard = createMemoizedComponent<{
  slot: DonationSlot
  isSelected: boolean
  onSelect: (slot: DonationSlot) => void
}>(({ slot, isSelected, onSelect }) => {
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
                <span>{slot.monastery.name} • {slot.monastery.location}</span>
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
              className={isSelected ? "dana-button dana-button-primary" : ""}
              variant={isSelected ? "default" : "outline"}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

// Export the memoized component
export const RefactoredDonationCalendar = createMemoizedComponent(
  RefactoredDonationCalendarComponent,
  (prevProps, nextProps) => 
    prevProps.selectedDate?.getTime() === nextProps.selectedDate?.getTime() &&
    prevProps.monasteryId === nextProps.monasteryId
)
