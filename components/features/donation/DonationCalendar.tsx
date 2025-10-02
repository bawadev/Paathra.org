'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Users, Plus, TrendingUp, Heart, Gift } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { DonationSlot, Monastery } from '@/lib/types'
import { MonasterySlotsDialog } from './MonasterySlotsDialog'

interface DonationSlotWithMonastery extends DonationSlot {
  monastery?: Monastery
}

interface DonationCalendarProps {
  onSlotSelect: (slot: DonationSlot | null) => void
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
  const t = useTranslations('DonationCalendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slots, setSlots] = useState<DonationSlotWithMonastery[]>([])
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<DonationSlot | null>(null)
  const [calendarStats, setCalendarStats] = useState({
    totalDonations: 0,
    recurringDonations: 0,
    mealsProvided: 0
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | null>(null)

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
          *,
          monastery:monasteries(*)
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
            .gte('donation_date', currentMonthStart)
            .lte('donation_date', currentMonthEnd)

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

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, DonationSlotWithMonastery[]> = {}
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
    setSelectedDateForDialog(date)
    setDialogOpen(true)
    setSelectedSlot(null)
    onSlotSelect(null)
  }, [onDateSelect, onSlotSelect])

  const handleDialogSlotSelect = useCallback((slot: DonationSlotWithMonastery) => {
    setSelectedSlot(slot)
    onSlotSelect(slot)
    setDialogOpen(false)
  }, [onSlotSelect])

  const handleMonasteryNavigate = useCallback((monasteryId: string) => {
    window.location.href = `/monasteries/${monasteryId}`
  }, [])

  const handleSlotSelect = useCallback((slot: DonationSlotWithMonastery) => {
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
    <div className={cn('max-w-7xl mx-auto space-y-8', className)}>
      {/* Header */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">{t('title')}</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-green-700 mb-0.5">{calendarStats.totalDonations}</p>
                    <p className="text-sm font-medium text-green-600/80">{t('thisMonth')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-blue-700 mb-0.5">{calendarStats.recurringDonations}</p>
                    <p className="text-sm font-medium text-blue-600/80">{t('recurring')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-purple-700 mb-0.5">{calendarStats.mealsProvided}</p>
                    <p className="text-sm font-medium text-purple-600/80">{t('mealsProvided')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card className="border border-gray-200/50 shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">{t('legend')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{t('availableSlots')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{t('limitedAvailability')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{t('specialDay')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-400 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{t('unavailable')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="shadow-elegant-lg border border-gray-200/50 overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-b border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t('selectDate')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="hover:bg-amber-50 hover:text-amber-700 border-amber-200 hover:border-amber-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md px-4 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="hover:bg-amber-50 hover:text-amber-700 border-amber-200 hover:border-amber-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md px-4 py-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-bold text-gray-700 py-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                    {t(`days.${day}`)}
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
                        'relative aspect-square p-2 sm:p-3 rounded-xl transition-all duration-300 border-2',
                        'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                        {
                          'text-gray-400 bg-gray-50/50 border-transparent': !isCurrentMonth,
                          'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl border-amber-400 scale-105': isSelected,
                          'ring-2 ring-amber-500 ring-offset-2 border-amber-400': isTodayDate && !isSelected,
                          'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 hover:scale-105': status === 'available' && !isSelected,
                          'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300 hover:from-orange-100 hover:to-red-100 hover:border-orange-400 hover:scale-105': status === 'full' && !isSelected,
                          'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50': status === 'unavailable',
                          'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-400 hover:scale-105': hasEvents && !isSelected && status !== 'available' && status !== 'full'
                        }
                      )}
                    >
                      <div className="flex flex-col items-center justify-center h-full relative">
                        <span className="text-base sm:text-lg font-bold">{format(date, 'd')}</span>
                        {hasEvents && (
                          <div className="mt-1.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-sm",
                              isSelected ? "bg-white" : "bg-amber-500"
                            )}></div>
                          </div>
                        )}
                        {isTodayDate && !isSelected && (
                          <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-md">
                            {t('today')}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <MonasterySlotsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDateForDialog}
        slots={selectedDateForDialog ? (slotsByDate[format(selectedDateForDialog, 'yyyy-MM-dd')] || []) : []}
        onSlotSelect={handleDialogSlotSelect}
        onMonasteryNavigate={handleMonasteryNavigate}
      />
    </div>
  )
}

// Memoized Slot Card Component
function SlotCard({
  slot,
  isSelected,
  onSelect
}: {
  slot: DonationSlotWithMonastery
  isSelected: boolean
  onSelect: (slot: DonationSlotWithMonastery) => void
}) {
  const t = useTranslations('DonationCalendar')
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
              {isAvailable ? t('available') : t('full')}
            </Badge>
          </div>

          {/* Monastery Info */}
          {slot.monastery && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{slot.monastery.name}</p>
                {slot.monastery.address && (
                  <p className="text-sm text-gray-600">{slot.monastery.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {slot.special_requirements && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('requirements')}:</strong> {slot.special_requirements}
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
                  {t('selected')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('selectSlot')}
                </>
              )}
            </Button>
          )}

          {/* Full Message */}
          {!isAvailable && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                {t('slotFullyBooked')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}