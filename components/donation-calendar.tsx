'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationSlot, Monastery } from '@/lib/supabase'
import { format, parseISO, isSameDay } from 'date-fns'
import { Clock, Users, MapPin } from 'lucide-react'

interface DonationCalendarProps {
  onSlotSelect: (slot: DonationSlot) => void
}

export function DonationCalendar({ onSlotSelect }: DonationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [monasteries, setMonasteries] = useState<Monastery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonasteries()
    fetchSlots()
  }, [])

  const fetchMonasteries = async () => {
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching monasteries:', error)
    } else {
      setMonasteries(data || [])
    }
  }

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

  const getSlotsForDate = (date: Date) => {
    return slots.filter(slot => 
      isSameDay(parseISO(slot.date), date) && 
      slot.monks_fed < slot.monks_capacity
    )
  }

  const getAvailableDates = () => {
    const availableDates = slots
      .filter(slot => slot.monks_fed < slot.monks_capacity)
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
              {selectedDateSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSlotSelect(slot)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{slot.monastery?.name}</h3>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{slot.monks_fed}/{slot.monks_capacity} monks fed</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${(slot.monks_fed / slot.monks_capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {slot.monks_capacity - slot.monks_fed} monks remaining
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{slot.monastery?.address}</span>
                      </div>

                      {slot.special_requirements && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          {slot.special_requirements}
                        </div>
                      )}

                      {slot.monastery?.dietary_requirements && (
                        <div className="flex flex-wrap gap-1">
                          {slot.monastery.dietary_requirements.map((req) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
