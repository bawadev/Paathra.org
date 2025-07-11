'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase, DonationSlot, Monastery } from '@/lib/supabase'
import { format, parseISO, addDays, isBefore, startOfDay } from 'date-fns'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'

export default function ManageSlotsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<Monastery | null>(null)
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Form state for creating slots
  const [formData, setFormData] = useState({
    date: '',
    time_slot: '',
    max_donors: 5,
    special_requirements: ''
  })

  useEffect(() => {
    if (user && profile?.user_type === 'monastery_admin') {
      fetchData()
    }
  }, [user, profile])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    
    // Fetch monastery
    const { data: monasteryData } = await supabase
      .from('monasteries')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (monasteryData) {
      setMonastery(monasteryData)
      
      // Fetch donation slots
      const { data: slotsData } = await supabase
        .from('donation_slots')
        .select('*')
        .eq('monastery_id', monasteryData.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .order('time_slot')

      setSlots(slotsData || [])
    }
    
    setLoading(false)
  }

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monastery) return

    const { error } = await supabase
      .from('donation_slots')
      .insert({
        monastery_id: monastery.id,
        date: formData.date,
        time_slot: formData.time_slot,
        max_donors: formData.max_donors,
        special_requirements: formData.special_requirements || null,
        created_by: user?.id
      })

    if (!error) {
      setIsCreateDialogOpen(false)
      setFormData({
        date: '',
        time_slot: '',
        max_donors: 5,
        special_requirements: ''
      })
      fetchData()
    }
  }

  const createBulkSlots = async () => {
    if (!monastery || !selectedDate) return

    const timeSlots = ['07:00', '11:30', '17:00']
    const slots = []

    // Create slots for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(selectedDate, i)
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      for (const timeSlot of timeSlots) {
        const specialReq = timeSlot === '07:00' 
          ? 'Breakfast donations - simple meals preferred'
          : timeSlot === '11:30' 
          ? 'Lunch donations - main meals welcome'
          : 'Dinner donations - light meals preferred'

        slots.push({
          monastery_id: monastery.id,
          date: format(date, 'yyyy-MM-dd'),
          time_slot: timeSlot,
          max_donors: 5,
          special_requirements: specialReq,
          created_by: user?.id
        })
      }
    }

    const { error } = await supabase
      .from('donation_slots')
      .upsert(slots, { 
        onConflict: 'monastery_id,date,time_slot',
        ignoreDuplicates: true 
      })

    if (!error) {
      fetchData()
    }
  }

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('donation_slots')
      .delete()
      .eq('id', slotId)

    if (!error) {
      fetchData()
    }
  }

  const toggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    const { error } = await supabase
      .from('donation_slots')
      .update({ is_available: !isAvailable })
      .eq('id', slotId)

    if (!error) {
      fetchData()
    }
  }

  const getSlotsForDate = (date: Date) => {
    return slots.filter(slot => 
      format(parseISO(slot.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || profile?.user_type !== 'monastery_admin') {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Donation Slots</h1>
          <p className="text-gray-600">
            Create and manage available time slots for donations at {monastery?.name}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading slots...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose a date to view or manage slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  className="rounded-md border"
                />
                
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={createBulkSlots}
                    className="w-full"
                    disabled={!selectedDate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bulk Slots (30 days)
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Single Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Donation Slot</DialogTitle>
                        <DialogDescription>
                          Add a new time slot for donations
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={createSlot} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time_slot">Time *</Label>
                          <Input
                            id="time_slot"
                            type="time"
                            value={formData.time_slot}
                            onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max_donors">Maximum Donors *</Label>
                          <Input
                            id="max_donors"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.max_donors}
                            onChange={(e) => setFormData(prev => ({ ...prev, max_donors: parseInt(e.target.value) }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="special_requirements">Special Requirements</Label>
                          <Textarea
                            id="special_requirements"
                            value={formData.special_requirements}
                            onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                            placeholder="Any special requirements for this time slot..."
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          Create Slot
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Slots List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Donation Slots
                    {selectedDate && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        for {format(selectedDate, 'MMMM d, yyyy')}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Manage available time slots for donations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-4">
                      {getSlotsForDate(selectedDate).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No slots available for this date</p>
                          <p className="text-sm">Create slots using the buttons on the left</p>
                        </div>
                      ) : (
                        getSlotsForDate(selectedDate).map((slot) => (
                          <div key={slot.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">
                                      {format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">
                                      {slot.current_bookings}/{slot.max_donors} booked
                                    </span>
                                  </div>

                                  <div className={`px-2 py-1 rounded-full text-xs ${
                                    slot.is_available 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {slot.is_available ? 'Active' : 'Disabled'}
                                  </div>
                                </div>

                                {slot.special_requirements && (
                                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    {slot.special_requirements}
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                                >
                                  {slot.is_available ? 'Disable' : 'Enable'}
                                </Button>
                                
                                {slot.current_bookings === 0 && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteSlot(slot.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Please select a date to view slots</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {slots.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Slots</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {slots.filter(s => s.is_available).length}
                      </div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {slots.reduce((sum, slot) => sum + slot.current_bookings, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {slots.reduce((sum, slot) => sum + slot.max_donors, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Capacity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
