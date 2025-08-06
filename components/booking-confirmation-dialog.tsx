'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, CheckCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface BookingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    food_type: string
    quantity?: string
    estimated_servings: number
    special_notes?: string
    special_instructions?: string
    donation_slots?: {
      date: string
      time_slot?: string
      monasteries?: {
        name: string
        address: string
      }
    }
    donation_slot?: {
      date: string
      time_slot?: string
      monastery?: {
        name: string
        address: string
      }
    }
  } | null
}

export function BookingConfirmationDialog({
  isOpen,
  onClose,
  booking,
}: BookingConfirmationDialogProps) {
  if (!booking) return null

  // Handle both donation_slots and donation_slot structures
  const slot = booking.donation_slots || booking.donation_slot
  const monastery = slot?.monasteries || slot?.monastery

  const safeDate = slot?.date ? new Date(slot.date) : new Date()
  const safeTime = slot?.time_slot || '09:00'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-green-600">
            Booking Confirmed!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your donation has been successfully booked. You'll receive confirmation details via email shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Food Type:</span>
              <Badge variant="secondary">{booking.food_type}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Quantity:</span>
              <span>{booking.quantity || 'As specified'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Servings:</span>
              <span>{booking.estimated_servings}</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div className="text-sm text-gray-600">
                  {format(safeDate, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-gray-600">
                  {format(parseISO(`2000-01-01T${safeTime}`), 'h:mm a')}
                </div>
              </div>
            </div>
            
            {monastery && (
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-gray-600">
                    {monastery.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {monastery.address}
                  </div>
                </div>
              </div>
            )}
          </div>

          {(booking.special_instructions || booking.special_notes) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="font-medium text-blue-900 mb-1">Special Instructions</div>
              <div className="text-sm text-blue-700">
                {booking.special_instructions || booking.special_notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            asChild
          >
            <Link href="/my-donations">
              View My Donations
            </Link>
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}