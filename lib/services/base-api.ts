import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/types'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export abstract class BaseApiService {
  protected async handleResponse<T>(
    response: { data: T | null; error: any }
  ): Promise<ApiResponse<T>> {
    if (response.error) {
      const error = new ApiError(
        response.error.message || 'An error occurred',
        response.error.code,
        response.error.details
      )
      return { data: null, error }
    }

    return { data: response.data, error: null }
  }

  protected async withRetry<T>(
    fn: () => Promise<ApiResponse<T>>,
    retries = 3,
    delay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fn()
        if (!result.error) {
          return result
        }
        lastError = result.error
      } catch (error) {
        lastError = error instanceof ApiError 
          ? error 
          : new ApiError('Unexpected error occurred')
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }

    return { data: null, error: lastError }
  }

  protected buildQueryFilters(filters: Record<string, any>) {
    return Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }
}

export class DonationService extends BaseApiService {
  async getSlots(params: {
    monasteryId?: string
    startDate?: string
    endDate?: string
    isAvailable?: boolean
  } = {}) {
    let query = supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(*)
      `)

    if (params.monasteryId) {
      query = query.eq('monastery_id', params.monasteryId)
    }

    if (params.startDate) {
      query = query.gte('date', params.startDate)
    }

    if (params.endDate) {
      query = query.lte('date', params.endDate)
    }

    if (params.isAvailable !== undefined) {
      query = query.eq('is_available', params.isAvailable)
    }

    query = query.order('date').order('start_time')

    return this.handleResponse(await query)
  }

  async getSlotsByMonth(month: Date, monasteryId?: string) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    return this.getSlots({
      monasteryId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isAvailable: true
    })
  }

  async createSlot(slot: {
    monasteryId: string
    date: string
    startTime: string
    endTime: string
    capacity: number
    requirements?: string
  }) {
    const response = await supabase
      .from('donation_slots')
      .insert({
        monastery_id: slot.monasteryId,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        capacity: slot.capacity,
        current_bookings: 0,
        is_available: true,
        requirements: slot.requirements
      })
      .select()

    return this.handleResponse(response)
  }

  async updateSlot(id: string, updates: {
    capacity?: number
    isAvailable?: boolean
    requirements?: string
  }) {
    const response = await supabase
      .from('donation_slots')
      .update(updates)
      .eq('id', id)
      .select()

    return this.handleResponse(response)
  }

  async deleteSlot(id: string) {
    const response = await supabase
      .from('donation_slots')
      .delete()
      .eq('id', id)

    return this.handleResponse(response)
  }
}

export class MonasteryService extends BaseApiService {
  async getMonasteries(params: {
    isActive?: boolean
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = supabase
      .from('monasteries')
      .select('*')

    if (params.isActive !== undefined) {
      query = query.eq('is_active', params.isActive)
    }

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    query = query.order('name')

    return this.handleResponse(await query)
  }

  async getMonasteryById(id: string) {
    const response = await supabase
      .from('monasteries')
      .select('*')
      .eq('id', id)
      .single()

    return this.handleResponse(response)
  }

  async createMonastery(monastery: {
    name: string
    address: string
    latitude: number
    longitude: number
    contactPerson: string
    phone: string
    email: string
    dietaryRequirements: string[]
    specialInstructions?: string
    capacity: number
    userId: string
  }) {
    const response = await supabase
      .from('monasteries')
      .insert({
        name: monastery.name,
        address: monastery.address,
        latitude: monastery.latitude,
        longitude: monastery.longitude,
        contact_person: monastery.contactPerson,
        phone: monastery.phone,
        email: monastery.email,
        dietary_requirements: monastery.dietaryRequirements,
        special_instructions: monastery.specialInstructions,
        capacity: monastery.capacity,
        user_id: monastery.userId,
        is_active: true
      })
      .select()

    return this.handleResponse(response)
  }

  async updateMonastery(id: string, updates: Partial<{
    name: string
    address: string
    latitude: number
    longitude: number
    contactPerson: string
    phone: string
    email: string
    dietaryRequirements: string[]
    specialInstructions: string
    capacity: number
    isActive: boolean
  }>) {
    const mappedUpdates = {
      ...(updates.name && { name: updates.name }),
      ...(updates.address && { address: updates.address }),
      ...(updates.latitude && { latitude: updates.latitude }),
      ...(updates.longitude && { longitude: updates.longitude }),
      ...(updates.contactPerson && { contact_person: updates.contactPerson }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.email && { email: updates.email }),
      ...(updates.dietaryRequirements && { dietary_requirements: updates.dietaryRequirements }),
      ...(updates.specialInstructions && { special_instructions: updates.specialInstructions }),
      ...(updates.capacity && { capacity: updates.capacity }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive })
    }

    const response = await supabase
      .from('monasteries')
      .update(mappedUpdates)
      .eq('id', id)
      .select()

    return this.handleResponse(response)
  }

  async deleteMonastery(id: string) {
    const response = await supabase
      .from('monasteries')
      .update({ is_active: false })
      .eq('id', id)

    return this.handleResponse(response)
  }
}

export class BookingService extends BaseApiService {
  async getUserBookings(userId: string, status?: string) {
    let query = supabase
      .from('donation_bookings')
      .select(`
        *,
        slot:donation_slots(*),
        monastery:monasteries(*)
      `)
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('booking_date', { ascending: false })

    return this.handleResponse(await query)
  }

  async getMonasteryBookings(monasteryId: string, status?: string) {
    let query = supabase
      .from('donation_bookings')
      .select(`
        *,
        slot:donation_slots(*),
        user:user_profiles(*)
      `)
      .eq('monastery_id', monasteryId)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('booking_date', { ascending: false })

    return this.handleResponse(await query)
  }

  async createBooking(booking: {
    userId: string
    slotId: string
    monasteryId: string
    foodType: string
    quantity: string
    specialInstructions?: string
  }) {
    const response = await supabase
      .from('donation_bookings')
      .insert({
        user_id: booking.userId,
        slot_id: booking.slotId,
        monastery_id: booking.monasteryId,
        food_type: booking.foodType,
        quantity: booking.quantity,
        special_instructions: booking.specialInstructions,
        status: 'pending',
        booking_date: new Date().toISOString()
      })
      .select()

    return this.handleResponse(response)
  }

  async updateBookingStatus(id: string, status: string, notes?: string) {
    const updates: any = { status }
    
    const response = await supabase
      .from('donation_bookings')
      .update(updates)
      .eq('id', id)
      .select()

    if (!response.error && status === 'confirmed') {
      await supabase
        .from('booking_confirmations')
        .insert({
          booking_id: id,
          confirmed_by: 'system',
          notes: notes
        })
    }

    return this.handleResponse(response)
  }

  async cancelBooking(id: string) {
    return this.updateBookingStatus(id, 'cancelled')
  }

  async completeBooking(id: string) {
    return this.updateBookingStatus(id, 'completed')
  }
}

export const donationService = new DonationService()
export const monasteryService = new MonasteryService()
export const bookingService = new BookingService()