import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { donationSlotSchema } from '@/lib/schemas'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const monasteryId = searchParams.get('monastery_id')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(name, address)
      `)
      .eq('is_active', true)

    if (monasteryId) {
      query = query.eq('monastery_id', monasteryId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })

    if (error) {
      console.error('Error fetching donation slots:', error)
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
    const { monastery_id, ...slotData } = body
    
    // Validate input
    const validatedData = donationSlotSchema.parse(slotData)

    // Check if user is admin of the monastery
    const { data: monastery, error: monasteryError } = await supabase
      .from('monasteries')
      .select('admin_id')
      .eq('id', monastery_id)
      .single()

    if (monasteryError || !monastery) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 }
      )
    }

    if (monastery.admin_id !== user.id) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 403 }
      )
    }

    // Create donation slot
    const { data, error } = await supabase
      .from('donation_slots')
      .insert({
        ...validatedData,
        monastery_id,
        current_donors: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating donation slot:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: SUCCESS_MESSAGES.SLOT_CREATED,
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
