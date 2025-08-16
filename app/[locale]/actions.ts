'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { withLocaleContext, getServerMessages, formatApiError } from '@/lib/api-locale-context'
import { supabase } from '@/lib/supabase'

// Example server action for creating a monastery with locale context
export const createMonastery = withLocaleContext(async (locale, formData: FormData) => {
  try {
    // Get localized messages
    const messages = await getServerMessages('Monastery')
    
    // Extract form data
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const adminId = formData.get('admin_id') as string
    
    // Validate required fields
    if (!name || !address || !capacity || !adminId) {
      return {
        success: false,
        message: await formatApiError('validationError', 'Monastery', 'Required fields are missing'),
        locale
      }
    }
    
    // Create monastery with locale context
    const { data: monastery, error } = await supabase
      .from('monasteries')
      .insert([
        {
          name,
          description,
          address,
          phone,
          email,
          capacity,
          admin_id: adminId,
          locale_context: locale, // Store which locale this was created from
          dietary_requirements: [],
          is_active: true,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return {
        success: false,
        message: await formatApiError('createError', 'Monastery', 'Failed to create monastery'),
        locale
      }
    }
    
    // Revalidate the monasteries page
    revalidatePath(`/${locale}/monasteries`)
    
    return {
      success: true,
      message: messages.createSuccess || 'Monastery created successfully',
      data: monastery,
      locale
    }
    
  } catch (error) {
    console.error('Server action error:', error)
    return {
      success: false,
      message: await formatApiError('serverError', 'Common', 'Internal server error'),
      locale: 'en' // fallback locale
    }
  }
})

// Example server action for updating monastery status
export const updateMonasteryStatus = withLocaleContext(async (locale, monasteryId: string, status: 'approved' | 'rejected') => {
  try {
    const messages = await getServerMessages('Monastery')
    
    if (!monasteryId || !status) {
      return {
        success: false,
        message: await formatApiError('validationError', 'Monastery', 'Monastery ID and status are required'),
        locale
      }
    }
    
    const { data: monastery, error } = await supabase
      .from('monasteries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', monasteryId)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return {
        success: false,
        message: await formatApiError('updateError', 'Monastery', 'Failed to update monastery status'),
        locale
      }
    }
    
    // Revalidate relevant pages
    revalidatePath(`/${locale}/monasteries`)
    revalidatePath(`/${locale}/admin/monasteries`)
    
    return {
      success: true,
      message: messages.updateSuccess || 'Monastery status updated successfully',
      data: monastery,
      locale
    }
    
  } catch (error) {
    console.error('Server action error:', error)
    return {
      success: false,
      message: await formatApiError('serverError', 'Common', 'Internal server error'),
      locale: 'en'
    }
  }
})

// Example server action for creating a donation booking
export const createDonationBooking = withLocaleContext(async (locale, formData: FormData) => {
  try {
    const messages = await getServerMessages('Booking')
    
    const donationSlotId = formData.get('donation_slot_id') as string
    const donorId = formData.get('donor_id') as string
    const foodType = formData.get('food_type') as string
    const estimatedServings = parseInt(formData.get('estimated_servings') as string)
    const monksToFeed = parseInt(formData.get('monks_to_feed') as string)
    const specialNotes = formData.get('special_notes') as string
    const contactPhone = formData.get('contact_phone') as string
    const donationDate = formData.get('donation_date') as string
    
    // Validate required fields
    if (!donationSlotId || !donorId || !foodType || !estimatedServings || !monksToFeed || !donationDate) {
      return {
        success: false,
        message: await formatApiError('validationError', 'Booking', 'Required fields are missing'),
        locale
      }
    }
    
    // Create booking with locale context
    const { data: booking, error } = await supabase
      .from('donation_bookings')
      .insert([
        {
          donation_slot_id: donationSlotId,
          donor_id: donorId,
          food_type: foodType,
          estimated_servings: estimatedServings,
          monks_to_feed: monksToFeed,
          special_notes: specialNotes,
          contact_phone: contactPhone,
          donation_date: donationDate,
          status: 'pending',
          locale_context: locale,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return {
        success: false,
        message: await formatApiError('createError', 'Booking', 'Failed to create booking'),
        locale
      }
    }
    
    // Revalidate relevant pages
    revalidatePath(`/${locale}/bookings`)
    revalidatePath(`/${locale}/monasteries/${donationSlotId}`)
    
    return {
      success: true,
      message: messages.createSuccess || 'Booking created successfully',
      data: booking,
      locale
    }
    
  } catch (error) {
    console.error('Server action error:', error)
    return {
      success: false,
      message: await formatApiError('serverError', 'Common', 'Internal server error'),
      locale: 'en'
    }
  }
})

// Example server action that redirects with locale context
export const approveAndRedirect = withLocaleContext(async (locale, monasteryId: string) => {
  const result = await updateMonasteryStatus(monasteryId, 'approved')
  
  if (result.success) {
    // Redirect to the monasteries page in the current locale
    redirect(`/${locale}/monasteries`)
  }
  
  return result
})