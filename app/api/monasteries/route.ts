import { NextRequest, NextResponse } from 'next/server'
import { getLocaleFromHeaders, getServerMessages, formatApiError } from '@/lib/api-locale-context'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const locale = await getLocaleFromHeaders()
    
    // Get localized messages for API responses
    const messages = await getServerMessages('Monastery')
    
    // Example: Get monasteries with locale context
    const { data: monasteries, error } = await supabase
      .from('monasteries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: await formatApiError('fetchError', 'Monastery', 'Failed to fetch monasteries'),
          locale 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: monasteries,
      message: messages.fetchSuccess || 'Monasteries fetched successfully',
      locale,
      count: monasteries?.length || 0
    })
    
  } catch (error) {
    console.error('API error:', error)
    const errorMessage = await formatApiError('serverError', 'Common', 'Internal server error')
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const locale = await getLocaleFromHeaders()
    const body = await request.json()
    
    // Get localized messages
    const messages = await getServerMessages('Monastery')
    
    // Validate required fields
    if (!body.name || !body.location) {
      return NextResponse.json(
        { 
          error: await formatApiError('validationError', 'Monastery', 'Name and location are required'),
          locale 
        },
        { status: 400 }
      )
    }
    
    // Create monastery with locale context
    const { data: monastery, error } = await supabase
      .from('monasteries')
      .insert([
        {
          ...body,
          locale_context: locale, // Store which locale this was created from
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: await formatApiError('createError', 'Monastery', 'Failed to create monastery'),
          locale 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: monastery,
      message: messages.createSuccess || 'Monastery created successfully',
      locale
    }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    const errorMessage = await formatApiError('serverError', 'Common', 'Internal server error')
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}