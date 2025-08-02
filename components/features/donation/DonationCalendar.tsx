'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users, Plus, TrendingUp, Heart, Gift } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'

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
  const [calendarStats, setCalendarStats] = useState({
    totalDonations: 0,
    recurringDonations: 0,
    mealsProvided: 0
  })

  const selectedDate = externalSelectedDate || internalSelectedDate

  useEffect(() => {
    fetchSlots()
    fetchCalendarStats()
  }, [currentMonth, monasteryId])

  const fetchSlots = async () => {
    setLoading(true)
    const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    
    try {
      let query = supabase
        .from('donation_slots')
        .select(`
          id,
          monastery_id,
          date,
          time_slot,
          max_donors,
          current_bookings,
          is_available,
          special_requirements,
          meal_type,
          monks_capacity,
          monks_fed,
          created_at,
          updated_at,
          monastery:monasteries(
            id,
            name,
            address,
            phone,
            email,
            website,
            capacity,
            dietary_requirements,
            description,
            image_url
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time_slot', { ascending: true })

      if (monasteryId) {
        query = query.eq('monastery_id', monasteryId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching slots:', error.message || error)
        console.error('Full error details:', JSON.stringify(error, null, 2))
        setSlots([])
      } else {
        setSlots(data || [])
      }
    } catch (error) {
      console.error('Error in fetchSlots:', error)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendarStats = async () => {
    try {
      // Fetch user's donation statistics
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentMonthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
        const currentMonthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
        
        try {
          // Get this month's donations
          const { count: monthCount } = await supabase
            .from('donation_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('donor_id', user.id)
            .gte('date', currentMonthStart)
            .lte('date', currentMonthEnd)

          // Get recurring donations - skip this as is_recurring column doesn't exist
          let recurringCount = 0

          setCalendarStats({
            totalDonations: monthCount || 0,
            recurringDonations: recurringCount,
            mealsProvided: (monthCount || 0) * 25 // Estimate 25 meals per donation
          })
        } catch (queryError) {
          console.error('Error in calendar stats queries:', queryError)
          setCalendarStats({
            totalDonations: 0,
            recurringDonations: 0,
            mealsProvided: 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching calendar stats:', error)
      setCalendarStats({
        totalDonations: 0,
        recurringDonations: 0,
        mealsProvided: 0
      })
    }
  }

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

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
      slot.is_available
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
    <div className={cn('max-w-7xl mx-auto space-y-6', className)}>
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Donation Calendar</h1>
        <p className="text-lg text-gray-600">Schedule and track your regular donations to monasteries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0">
            <CardContent className="p-6">
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => onSlotSelect(null as any)} // This will trigger the booking flow
              >
                <Plus className="w-5 h-5 mr-2" />
                Schedule Donation
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{calendarStats.totalDonations}</p>
                    <p className="text-sm text-green-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{calendarStats.recurringDonations}</p>
                    <p className="text-sm text-blue-600">Recurring</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{calendarStats.mealsProvided}</p>
                    <p className="text-sm text-purple-600">Meals Provided</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Available Slots</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-700">Limited Availability</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-700">Special Day</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-700">Unavailable</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select a date to view available donation slots
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToPreviousMonth}
                    className="hover:bg-amber-50 hover:text-amber-700 border-amber-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToNextMonth}
                    className="hover:bg-amber-50 hover:text-amber-700 border-amber-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-700 py-3 bg-gray-50 rounded-t-lg">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: startOfMonth(currentMonth).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {calendarDays.map(date => {
                  const dateKey = format(date, 'yyyy-MM-dd')
                  const status = getDateStatus(date)
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  const isCurrentMonth = isSameMonth(date, currentMonth)
                  const isTodayDate = isToday(date)
                  const daySlots = slotsByDate[dateKey] || []
                  const hasEvents = daySlots.length > 0
                  
                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDateSelect(date)}
                      disabled={!isCurrentMonth || status === 'unavailable'}
                      className={cn(
                        'relative aspect-square p-2 rounded-lg transition-all duration-200 border',
                        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500',
                        {
                          'text-gray-400 bg-gray-50': !isCurrentMonth,
                          'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg': isSelected,
                          'ring-2 ring-amber-500 ring-offset-2': isTodayDate && !isSelected,
                          'bg-green-50 border-green-200 hover:bg-green-100': status === 'available' && !isSelected,
                          'bg-orange-50 border-orange-200 hover:bg-orange-100': status === 'full' && !isSelected,
                          'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed': status === 'unavailable',
                          'bg-amber-50 border-amber-200 hover:bg-amber-100': hasEvents && !isSelected
                        }
                      )}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-lg font-semibold">{format(date, 'd')}</span>
                        {hasEvents && (
                          <div className="mt-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          </div>
                        )}
                        {isTodayDate && !isSelected && (
                          <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Slots */}
          {selectedDate && (
            <Card className="mt-6 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">
                  Available Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {selectedDateSlots.length} donation slot{selectedDateSlots.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading slots...</p>
                  </div>
                ) : selectedDateSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No donation slots available for this date</p>
                    <p className="text-sm text-gray-500 mt-2">Try selecting a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
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
  const isAvailable = slot.is_available
  
  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg',
        isSelected && 'ring-2 ring-amber-500 shadow-xl',
        !isAvailable && 'opacity-75',
        'cursor-pointer'
      )}
      onClick={() => isAvailable && onSelect(slot)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Time and Availability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-lg">
                {slot.time_slot}
              </span>
            </div>
            <Badge 
              variant={isAvailable ? "default" : "secondary"}
              className={cn(
                isAvailable && "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
                !isAvailable && "bg-gradient-to-r from-gray-500 to-gray-600"
              )}
            >
              {isAvailable ? 'Available' : 'Full'}
            </Badge>
          </div>

          {/* Monastery Info */}
          {slot.monastery && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{slot.monastery.name}</p>
                {slot.monastery.location && (
                  <p className="text-sm text-gray-600">{slot.monastery.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {slot.special_requirements && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Requirements:</strong> {slot.special_requirements}
              </p>
            </div>
          )}

          {/* Action Button */}
          {isAvailable && (
            <Button 
              className={cn(
                "w-full font-semibold",
                isSelected 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                  : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800"
              )}
            >
              {isSelected ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Select Slot
                </>
              )}
            </Button>
          )}

          {/* Full Message */}
          {!isAvailable && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                This slot is fully booked
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}