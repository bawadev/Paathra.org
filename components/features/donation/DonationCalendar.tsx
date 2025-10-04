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

      {/* Stats Cards - Mobile First (1-3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:hidden gap-2 sm:gap-4 mb-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-sm">
                    <Gift className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl sm:text-3xl font-bold text-green-700 mb-0">{calendarStats.totalDonations}</p>
                    <p className="text-xs sm:text-sm font-medium text-green-600/80">{t('thisMonth')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-sm">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl sm:text-3xl font-bold text-blue-700 mb-0">{calendarStats.recurringDonations}</p>
                    <p className="text-xs sm:text-sm font-medium text-blue-600/80">{t('recurring')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-sm">
                    <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl sm:text-3xl font-bold text-purple-700 mb-0">{calendarStats.mealsProvided}</p>
                    <p className="text-xs sm:text-sm font-medium text-purple-600/80">{t('mealsProvided')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards - Desktop Only */}
          <div className="hidden lg:block space-y-4">
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

          {/* Legend - Desktop Only */}
          <Card className="hidden lg:block border border-gray-200/50 shadow-elegant">
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
            <CardHeader className="pb-6 bg-gradient-to-br from-[#D4A574]/20 to-[#EA8B6F]/10 border-b border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-xl shadow-md">
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
                    className="hover:bg-[#D4A574]/10 hover:text-[#C69564] border-[#D4A574]/30 hover:border-[#D4A574]/60 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md px-4 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="hover:bg-[#D4A574]/10 hover:text-[#C69564] border-[#D4A574]/30 hover:border-[#D4A574]/60 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md px-4 py-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-1 sm:p-4 md:p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 sm:gap-2 md:gap-3">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                  <div key={day} className="text-center text-[9px] sm:text-xs md:text-sm font-semibold text-gray-600 pb-1 sm:pb-2 md:pb-3 leading-none">
                    {t(`days.${day}`)}
                  </div>
                ))}

                {Array.from({ length: startOfMonth(currentMonth).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="flex items-center justify-center">
                    <div className="w-full aspect-square" />
                  </div>
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
                    <div key={dateKey} className="flex items-center justify-center">
                      <button
                        onClick={() => handleDateSelect(date)}
                        disabled={!isCurrentMonth || status === 'unavailable'}
                        className={cn(
                          'relative w-full aspect-square rounded-full transition-all duration-300',
                          'hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-[#D4A574] focus:ring-offset-0',
                          {
                            'text-gray-400 bg-transparent': !isCurrentMonth,
                            'bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] text-white shadow-xl scale-105': isSelected,
                            'ring-1 ring-[#D4A574]': isTodayDate && !isSelected,
                            'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:scale-105': status === 'available' && !isSelected,
                            'bg-gradient-to-br from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 hover:scale-105': status === 'full' && !isSelected,
                            'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50': status === 'unavailable',
                            'bg-gradient-to-br from-[#D4A574]/30 to-yellow-300 text-gray-700 hover:from-[#D4A574]/40 hover:to-yellow-400 hover:scale-105': hasEvents && !isSelected && status !== 'available' && status !== 'full'
                          }
                        )}
                      >
                        <div className="flex flex-col items-center justify-center h-full relative">
                          <span className="text-xs sm:text-sm md:text-base font-bold">{format(date, 'd')}</span>
                        {isTodayDate && !isSelected && (
                          <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] text-white px-1.5 py-0.5 rounded-full shadow-md">
                            {t('today')}
                          </span>
                        )}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Legend - Mobile Only (shown after calendar) */}
      <Card className="lg:hidden border border-gray-200/50 shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">{t('legend')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('availableSlots')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-sm"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('limitedAvailability')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-sm"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('specialDay')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400 shadow-sm"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('unavailable')}</span>
          </div>
        </CardContent>
      </Card>

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
                  ? "bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white"
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