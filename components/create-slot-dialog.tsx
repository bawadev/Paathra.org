'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Clock, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface CreateSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monasteryId: string
  preSelectedDate?: Date | undefined
  onSlotCreated: (slot: any) => void
}

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00'
]

export function CreateSlotDialog({
  open,
  onOpenChange,
  monasteryId,
  preSelectedDate,
  onSlotCreated
}: CreateSlotDialogProps) {
  const [date, setDate] = useState(preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
  const [timeSlot, setTimeSlot] = useState('12:00')
  const [capacity, setCapacity] = useState(50)
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSlot = async () => {
    if (!monasteryId) {
      setError('Monastery ID is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('donation_slots')
        .insert({
          monastery_id: monasteryId,
          date,
          time_slot: timeSlot,
          capacity,
          max_donors: Math.max(1, Math.floor(capacity / 25)), // Estimate max donors based on capacity
          special_requirements: specialRequirements || null,
          is_available: true,
          created_by: 'monastery_admin',
          monks_capacity: capacity,
          monks_fed: 0
        })
        .select(`
          *,
          monastery:monasteries(*)
        `)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        onSlotCreated(data)
        onOpenChange(false)
        // Reset form
        setDate(preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        setTimeSlot('12:00')
        setCapacity(50)
        setSpecialRequirements('')
      }
    } catch (err) {
      setError('Failed to create slot')
    } finally {
      setLoading(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form on close
      setDate(preSelectedDate ? format(preSelectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
      setTimeSlot('12:00')
      setCapacity(50)
      setSpecialRequirements('')
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Booking Slot</DialogTitle>
          <DialogDescription>
            Create a new donation slot for your monastery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timeSlot">Time Slot</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="capacity">Capacity (servings)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="capacity"
                type="number"
                min="1"
                max="500"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 50)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequirements">Special Requirements (optional)</Label>
            <Textarea
              id="specialRequirements"
              placeholder="Any special dietary requirements or notes..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSlot}
            disabled={loading || !date || !timeSlot || capacity <= 0}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Slot
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}