import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { donationBookingSchema } from '@/lib/schemas'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const slotId = searchParams.get('slot_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    let query = supabase
      .from('donation_bookings')
      .select(`
        *,
        donor:user_profiles(full_name, phone),
        slot:donation_slots(
          date,
          time_slot,
          monastery:monasteries(name, address)
        )
      `)

    // If user_id is specified and it's the current user, or user is admin, allow access
    if (userId) {
      if (userId !== user.id) {
        // Check if user has admin privileges
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_types')
          .eq('user_id', user.id)
          .single()

        if (!profile?.user_types?.includes('super_admin')) {
          return NextResponse.json(
            { error: ERROR_MESSAGES.UNAUTHORIZED },
            { status: 403 }
          )
        }
      }
      query = query.eq('donor_id', userId)
    } else {
      // Default to current user's bookings
      query = query.eq('donor_id', user.id)
    }

    if (slotId) {
      query = query.eq('slot_id', slotId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching donation bookings:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasNextPage: count ? count > page * limit : false,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { slot_id, ...bookingData } = body
    
    // Validate input
    const validatedData = donationBookingSchema.parse(bookingData)

    // Check if slot exists and has capacity
    const { data: slot, error: slotError } = await supabase
      .from('donation_slots')
      .select('max_donors, current_donors, is_active')
      .eq('id', slot_id)
      .single()

    if (slotError || !slot) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    if (!slot.is_active) {
      return NextResponse.json(
        { error: 'This donation slot is no longer active' },
        { status: 400 }
      )
    }

    if (slot.current_donors >= slot.max_donors) {
      return NextResponse.json(
        { error: 'This donation slot is fully booked' },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this slot
    const { data: existingBooking } = await supabase
      .from('donation_bookings')
      .select('id')
      .eq('donor_id', user.id)
      .eq('slot_id', slot_id)
      .eq('status', 'confirmed')
      .single()

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this slot' },
        { status: 400 }
      )
    }

    // Create booking and update slot counter in a transaction
    const { data, error } = await supabase.rpc('create_donation_booking', {
      p_donor_id: user.id,
      p_slot_id: slot_id,
      p_food_type: validatedData.food_type,
      p_estimated_servings: parseInt(validatedData.estimated_servings),
      p_special_notes: validatedData.special_notes,
      p_contact_phone: validatedData.contact_phone,
    })

    if (error) {
      console.error('Error creating donation booking:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: SUCCESS_MESSAGES.BOOKING_CREATED,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json(
        { error: ERROR_MESSAGES.VALIDATION, details: error },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    )
  }
}
