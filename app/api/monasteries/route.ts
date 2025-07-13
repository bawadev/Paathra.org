import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { monasterySchema } from '@/lib/schemas'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('monasteries')
      .select('*')
      .eq('is_active', true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching monasteries:', error)
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
    
    // Validate input
    const validatedData = monasterySchema.parse(body)

    // Create monastery
    const { data, error } = await supabase
      .from('monasteries')
      .insert({
        ...validatedData,
        admin_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating monastery:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.GENERIC },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: SUCCESS_MESSAGES.MONASTERY_CREATED,
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
