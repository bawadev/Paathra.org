'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationSlot } from '@/lib/supabase'
import { format, parseISO, isSameDay } from 'date-fns'
import { Clock, Users, MapPin } from 'lucide-react'

interface DonationCalendarProps {
  onSlotSelect: (slot: DonationSlot) => void
}

export function DonationCalendar({ onSlotSelect }: DonationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(*)
      `)
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time_slot')

    if (error) {
      console.error('Error fetching slots:', error)
    } else {
      setSlots(data || [])
    }
    setLoading(false)
  }

  const getEffectiveCapacity = (slot: DonationSlot) => {
    // Use monastery capacity if available, otherwise fall back to slot capacity
    return (slot as any).monastery?.capacity || slot.monks_capacity || 0
  }

  const getSlotsForDate = (date: Date) => {
    return slots.filter(slot => {
      const effectiveCapacity = getEffectiveCapacity(slot)
      return isSameDay(parseISO(slot.date), date) && 
             slot.is_available &&
             (effectiveCapacity === 0 || slot.monks_fed < effectiveCapacity)
    })
  }

  const getAvailableDates = () => {
    const availableDates = slots
      .filter(slot => {
        const effectiveCapacity = getEffectiveCapacity(slot)
        return slot.is_available &&
               (effectiveCapacity === 0 || slot.monks_fed < effectiveCapacity)
      })
      .map(slot => parseISO(slot.date))
    
    return availableDates
  }

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>
            Choose a date to see available donation slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date < today || !getAvailableDates().some(availableDate => 
                isSameDay(availableDate, date)
              )
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Available Slots
            {selectedDate && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                for {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Click on a slot to make a donation booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading slots...</div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedDate 
                ? 'No available slots for this date' 
                : 'Please select a date to view available slots'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateSlots.map((slot) => {
                const effectiveCapacity = getEffectiveCapacity(slot)
                const monasteryData = (slot as any).monastery
                return (
                <div
                  key={slot.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSlotSelect(slot)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{monasteryData?.name || 'Monastery'}</h3>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {effectiveCapacity > 0
                              ? `${slot.monks_fed || 0}/${effectiveCapacity} servings used`
                              : 'Open capacity'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {effectiveCapacity > 0 && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${((slot.monks_fed || 0) / effectiveCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {effectiveCapacity - (slot.monks_fed || 0)} servings remaining
                          </div>
                        </div>
                      )}

                      {effectiveCapacity === 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Flexible capacity - Contact monastery for details
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{monasteryData?.address || 'Address not provided'}</span>
                      </div>

                      {slot.special_requirements && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          {slot.special_requirements}
                        </div>
                      )}

                      {monasteryData?.dietary_requirements && (
                        <div className="flex flex-wrap gap-1">
                          {monasteryData.dietary_requirements.map((req: string) => (
                            <Badge key={req} variant="secondary" className="text-xs">
                              {req.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button size="sm">
                      Book Slot
                    </Button>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
