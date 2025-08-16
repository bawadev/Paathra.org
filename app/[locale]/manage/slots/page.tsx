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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase, DonationSlot, Monastery } from '@/lib/supabase'
import { format, parseISO, addDays, isBefore, startOfDay } from 'date-fns'
import { hasRole } from '@/types/auth'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  Trash2,
  AlertCircle,
  Edit3
} from 'lucide-react'

export default function ManageSlotsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<Monastery | null>(null)
  const [slots, setSlots] = useState<DonationSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<DonationSlot | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Form state for creating slots
  const [formData, setFormData] = useState({
    date: '',
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner',
    time_slot: '',
    monks_capacity: 10,
    max_donors: 5,
    booking_notes: ''
  })

  // Form state for editing slots
  const [editFormData, setEditFormData] = useState({
    date: '',
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner',
    time_slot: '',
    monks_capacity: 10,
    max_donors: 5,
    booking_notes: ''
  })

  useEffect(() => {
    if (user && hasRole(profile, 'monastery_admin')) {
      fetchData()
    }
  }, [user, profile])

  // Update time slot when meal type changes
  useEffect(() => {
    if (monastery && formData.meal_type) {
      const defaultTime = getDefaultTimeForMeal(monastery, formData.meal_type)
      setFormData(prev => ({
        ...prev,
        time_slot: defaultTime,
        monks_capacity: monastery.capacity || 10
      }))
    }
  }, [formData.meal_type, monastery])

  const getDefaultTimeForMeal = (monastery: Monastery, mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return monastery.breakfast_time?.substring(0, 5) || '07:00'
      case 'lunch':
        return monastery.lunch_time?.substring(0, 5) || '11:30'
      case 'dinner':
        return monastery.dinner_time?.substring(0, 5) || '17:00'
      default:
        return '11:30'
    }
  }

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

    // Check if slot already exists for this date/meal type/monastery
    const { data: existingSlots } = await supabase
      .from('donation_slots')
      .select('id')
      .eq('monastery_id', monastery.id)
      .eq('date', formData.date)
      .eq('meal_type', formData.meal_type)

    if (existingSlots && existingSlots.length > 0) {
      alert(`A ${formData.meal_type} slot already exists for this date`)
      return
    }

    const { error } = await supabase
      .from('donation_slots')
      .insert({
        monastery_id: monastery.id,
        date: formData.date,
        time_slot: formData.time_slot,
        meal_type: formData.meal_type,
        monks_capacity: formData.monks_capacity,
        max_donors: formData.max_donors,
        booking_notes: formData.booking_notes || null,
        is_available: true,
        monks_fed: 0,
        current_bookings: 0,
        created_by: user?.id
      })

    if (!error) {
      // Update monastery's default meal time if it was changed
      const currentDefaultTime = getDefaultTimeForMeal(monastery, formData.meal_type)
      if (formData.time_slot !== currentDefaultTime) {
        const updateField = `${formData.meal_type}_time`
        await supabase
          .from('monasteries')
          .update({
            [updateField]: `${formData.time_slot}:00`
          })
          .eq('id', monastery.id)
      }

      setIsCreateDialogOpen(false)
      setFormData({
        date: '',
        meal_type: 'lunch',
        time_slot: '',
        monks_capacity: 10,
        max_donors: 5,
        special_requirements: '',
        booking_notes: ''
      })
      fetchData()
    }
  }

  const createBulkSlots = async () => {
    if (!monastery || !selectedDate) return

    const mealSlots = [
      { time: '07:00', meal_type: 'breakfast' },
      { time: '11:30', meal_type: 'lunch' },
      { time: '17:00', meal_type: 'dinner' }
    ]
    const slots = []

    // Create slots for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(selectedDate, i)
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      for (const mealSlot of mealSlots) {
        slots.push({
          monastery_id: monastery.id,
          date: format(date, 'yyyy-MM-dd'),
          time_slot: mealSlot.time,
          meal_type: mealSlot.meal_type,
          monks_capacity: monastery.capacity || 10,
          max_donors: 5,
          booking_notes: null,
          is_available: true,
          monks_fed: 0,
          current_bookings: 0,
          created_by: user?.id
        })
      }
    }

    const { error } = await supabase
      .from('donation_slots')
      .upsert(slots, { 
        onConflict: 'monastery_id,date,meal_type',
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

  const startEditingSlot = (slot: DonationSlot) => {
    setEditingSlot(slot)
    setEditFormData({
      date: slot.date,
      meal_type: slot.meal_type as 'breakfast' | 'lunch' | 'dinner',
      time_slot: slot.time_slot,
      monks_capacity: slot.monks_capacity,
      max_donors: slot.max_donors,
      special_requirements: slot.special_requirements || '',
      booking_notes: slot.booking_notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const editSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSlot) return

    const { error } = await supabase
      .from('donation_slots')
      .update({
        date: editFormData.date,
        time_slot: editFormData.time_slot,
        meal_type: editFormData.meal_type,
        monks_capacity: editFormData.monks_capacity,
        max_donors: editFormData.max_donors,
        booking_notes: editFormData.booking_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingSlot.id)

    if (!error) {
      setIsEditDialogOpen(false)
      setEditingSlot(null)
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

  if (!user || !hasRole(profile, 'monastery_admin')) {
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
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Auto-populate selected date when opening dialog
                          if (selectedDate) {
                            setFormData(prev => ({
                              ...prev,
                              date: format(selectedDate, 'yyyy-MM-dd')
                            }))
                          }
                        }}
                      >
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
                          <Label htmlFor="meal_type">Meal Type *</Label>
                          <Select
                            value={formData.meal_type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value as 'breakfast' | 'lunch' | 'dinner' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <p className="text-xs text-muted-foreground">
                            This will become the default time for {formData.meal_type} at this monastery
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="monks_capacity">Monks Capacity</Label>
                            <Input
                              id="monks_capacity"
                              type="number"
                              value={formData.monks_capacity}
                              onChange={(e) => setFormData(prev => ({ ...prev, monks_capacity: parseInt(e.target.value) || 0 }))}
                              min="0"
                              placeholder="Number of monks to feed"
                            />
                            <p className="text-xs text-muted-foreground">
                              Capacity for this specific day only
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="max_donors">Max Donors</Label>
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="booking_notes">Important Notes for Donors</Label>
                          <Textarea
                            id="booking_notes"
                            value={formData.booking_notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, booking_notes: e.target.value }))}
                            placeholder="Important notes that donors should see when booking this slot..."
                          />
                          <p className="text-xs text-muted-foreground">
                            These notes will be prominently displayed to donors when they book this slot
                          </p>
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
                                      {slot.monks_fed}/{slot.monks_capacity} monks fed
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

                                {/* Feeding Progress */}
                                <div className="mt-2">
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
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingSlot(slot)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                
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

              {/* Edit Slot Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Donation Slot</DialogTitle>
                    <DialogDescription>
                      Update the details for this donation slot
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editSlot} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-date">Date *</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-meal_type">Meal Type *</Label>
                      <Select
                        value={editFormData.meal_type}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, meal_type: value as 'breakfast' | 'lunch' | 'dinner' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-time_slot">Time *</Label>
                      <Input
                        id="edit-time_slot"
                        type="time"
                        value={editFormData.time_slot}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, time_slot: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-monks_capacity">Monks Capacity</Label>
                        <Input
                          id="edit-monks_capacity"
                          type="number"
                          value={editFormData.monks_capacity}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, monks_capacity: parseInt(e.target.value) || 0 }))}
                          min="0"
                          placeholder="Number of monks to feed"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-max_donors">Max Donors</Label>
                        <Input
                          id="edit-max_donors"
                          type="number"
                          min="1"
                          max="20"
                          value={editFormData.max_donors}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, max_donors: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-booking_notes">Important Notes for Donors</Label>
                      <Textarea
                        id="edit-booking_notes"
                        value={editFormData.booking_notes}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, booking_notes: e.target.value }))}
                        placeholder="Important notes that donors should see when booking this slot..."
                      />
                      <p className="text-xs text-muted-foreground">
                        These notes will be prominently displayed to donors when they book this slot
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1">
                        Update Slot
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

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
                        {slots.reduce((sum, slot) => sum + slot.monks_fed, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Monks Fed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {slots.reduce((sum, slot) => sum + slot.monks_capacity, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Monk Capacity</div>
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
