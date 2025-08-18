import { supabase } from '@/lib/supabase'

export interface BookingWorkflowTransition {
  from: string[]
  to: string
  allowedRoles: ('donor' | 'monastery_admin' | 'super_admin')[]
  requiresData?: string[]
}

// Define the allowed workflow transitions
export const BOOKING_WORKFLOW: Record<string, BookingWorkflowTransition> = {
  // Monastery can approve pending bookings
  approve: {
    from: ['pending'],
    to: 'monastery_approved',
    allowedRoles: ['monastery_admin', 'super_admin'],
  },
  
  // Donor can confirm monastery-approved bookings
  confirm: {
    from: ['monastery_approved'],
    to: 'confirmed',
    allowedRoles: ['donor'],
  },
  
  // Monastery can mark confirmed donations as delivered
  markDelivered: {
    from: ['confirmed', 'monastery_approved'],
    to: 'delivered',
    allowedRoles: ['monastery_admin', 'super_admin'],
    requiresData: ['delivery_confirmed_by'],
  },
  
  // Monastery can mark confirmed donations as not delivered
  markNotDelivered: {
    from: ['confirmed', 'monastery_approved'],
    to: 'not_delivered',
    allowedRoles: ['monastery_admin', 'super_admin'],
    requiresData: ['delivery_confirmed_by'],
  },
  
  // Anyone can cancel at most stages (with restrictions)
  cancel: {
    from: ['pending', 'monastery_approved', 'confirmed'],
    to: 'cancelled',
    allowedRoles: ['donor', 'monastery_admin', 'super_admin'],
  },
  
  // Monastery admins can reopen recent cancellations
  reopen: {
    from: ['cancelled'],
    to: 'pending',
    allowedRoles: ['monastery_admin', 'super_admin'],
  },
}

export interface BookingTransitionData {
  bookingId: string
  transition: keyof typeof BOOKING_WORKFLOW
  userId: string
  userRole: 'donor' | 'monastery_admin' | 'super_admin'
  data?: {
    delivery_notes?: string
    cancellation_reason?: string
  }
}

export async function executeBookingTransition({
  bookingId,
  transition,
  userId,
  userRole,
  data = {}
}: BookingTransitionData) {
  try {
    // Get the workflow definition
    const workflow = BOOKING_WORKFLOW[transition]
    if (!workflow) {
      throw new Error(`Invalid transition: ${transition}`)
    }

    // Check if user role is allowed
    if (!workflow.allowedRoles.includes(userRole)) {
      throw new Error(`Role ${userRole} not allowed for transition ${transition}`)
    }

    // Get current booking status
    const { data: booking, error: fetchError } = await supabase
      .from('donation_bookings')
      .select(`
        status, 
        donor_id, 
        donation_slot:donation_slots!inner(
          monastery:monasteries!inner(admin_id)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch booking: ${fetchError.message}`)
    }

    // Check if current status allows this transition
    if (!workflow.from.includes(booking.status)) {
      throw new Error(`Cannot transition from ${booking.status} to ${workflow.to}`)
    }

    // Additional role-based checks
    if (userRole === 'donor' && booking.donor_id !== userId) {
      throw new Error('Donors can only modify their own bookings')
    }

    if (userRole === 'monastery_admin') {
      const monasteryAdminId = (booking.donation_slot as any)?.monastery?.admin_id
      if (monasteryAdminId !== userId) {
        throw new Error('Monastery admins can only modify bookings for their monastery')
      }
    }

    // Prepare update data
    const updateData: any = {
      status: workflow.to,
      updated_at: new Date().toISOString(),
    }

    // Set appropriate timestamps and metadata
    switch (transition) {
      case 'approve':
        updateData.monastery_approved_at = new Date().toISOString()
        updateData.monastery_approved_by = userId
        break
      case 'confirm':
        updateData.confirmed_at = new Date().toISOString()
        break
      case 'markDelivered':
      case 'markNotDelivered':
        updateData.delivery_confirmed_at = new Date().toISOString()
        updateData.delivery_confirmed_by = userId
        updateData.delivery_status = transition === 'markDelivered' ? 'received' : 'not_received'
        if (data.delivery_notes) {
          updateData.delivery_notes = data.delivery_notes
        }
        break
    }

    // Execute the update
    const { data: updatedBooking, error: updateError } = await supabase
      .from('donation_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        donation_slot:donation_slots(
          *,
          monastery:monasteries(*)
        ),
        donor:user_profiles(*)
      `)
      .single()

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`)
    }

    // Log the transition for audit trail
    await logBookingTransition(bookingId, booking.status, workflow.to, userId, transition)

    return {
      success: true,
      booking: updatedBooking,
      message: `Booking ${transition} successful`
    }

  } catch (error) {
    console.error('Booking transition error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      booking: null
    }
  }
}

async function logBookingTransition(
  bookingId: string,
  fromStatus: string,
  toStatus: string,
  userId: string,
  action: string
) {
  try {
    await supabase
      .from('booking_confirmations')
      .insert({
        booking_id: bookingId,
        reminder_type: action === 'approve' ? 'monastery_approval' : 
                     action === 'markDelivered' || action === 'markNotDelivered' ? 'delivery' : 
                     '1_day',
        sent_by: userId,
        method: 'manual',
        notes: `Status changed from ${fromStatus} to ${toStatus}`,
      })
  } catch (error) {
    console.error('Failed to log booking transition:', error)
    // Don't throw here as this is just logging
  }
}

// Helper function to get available actions for a booking
export function getAvailableActionsForBooking(
  booking: { status: string; donor_id: string },
  userId: string,
  userRole: 'donor' | 'monastery_admin' | 'super_admin'
): string[] {
  const availableActions: string[] = []

  for (const [action, workflow] of Object.entries(BOOKING_WORKFLOW)) {
    // Check if user role is allowed
    if (!workflow.allowedRoles.includes(userRole)) {
      continue
    }

    // Check if current status allows this transition
    if (!workflow.from.includes(booking.status)) {
      continue
    }

    // Additional role-based checks
    if (userRole === 'donor' && booking.donor_id !== userId) {
      continue
    }

    availableActions.push(action)
  }

  return availableActions
}
