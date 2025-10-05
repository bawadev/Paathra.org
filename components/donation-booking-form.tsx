'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { supabase, DonationSlot } from '@/lib/supabase'
import { donationBookingSchema, type DonationBookingInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TextField, TextareaField } from '@/components/forms/FormFields'
import { format, parseISO } from 'date-fns'
import { Clock, MapPin, Users } from 'lucide-react'

// Extended slot type with monastery data
interface ExtendedDonationSlot extends DonationSlot {
  monastery?: {
    name: string
    capacity: number
    address: string
    special_requirements?: string
  }
  monastery_name?: string
  monastery_address?: string
}

interface DonationBookingFormProps {
  slot: ExtendedDonationSlot
  onSuccess: (bookingData: any) => void
  onCancel: () => void
}

export function DonationBookingForm({ slot, onSuccess, onCancel }: DonationBookingFormProps) {
  const { user } = useAuthStore()
  const t = useTranslations('BookingForm')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<DonationBookingInput>({
    resolver: zodResolver(donationBookingSchema),
    defaultValues: {
      food_type: '',
      estimated_servings: '',
      special_notes: '',
      contact_phone: '',
    },
  })

  const handleSubmit = async (data: DonationBookingInput) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const estimatedServings = parseInt(data.estimated_servings)
      
      // Get the effective capacity (monastery capacity or slot capacity)
      const effectiveCapacity = slot.monastery?.capacity || slot.monks_capacity || 0
      const remainingCapacity = effectiveCapacity - (slot.monks_fed || 0)

      if (estimatedServings > remainingCapacity) {
        setError(t('errorCapacityExceeded', { remaining: remainingCapacity }))
        setLoading(false)
        return
      }

      // Optimistic check: re-fetch slot data to ensure it hasn't changed
      const { data: currentSlot, error: fetchError } = await supabase
        .from('donation_slots')
        .select(`
          monks_capacity,
          monks_fed,
          monastery:monasteries(capacity)
        `)
        .eq('id', slot.id)
        .single()

      if (fetchError) {
        setError(t('errorVerifySlot'))
        setLoading(false)
        return
      }

      const currentEffectiveCapacity = (currentSlot as any).monastery?.capacity || currentSlot.monks_capacity || 0
      const currentRemainingCapacity = currentEffectiveCapacity - (currentSlot.monks_fed || 0)

      if (estimatedServings > currentRemainingCapacity) {
        setError(t('errorSlotUpdated', { remaining: currentRemainingCapacity }))
        setLoading(false)
        return
      }

      // Use a transaction to ensure both booking creation and slot update happen atomically
      const { data: bookingData, error: bookingError } = await supabase.rpc('create_booking_with_slot_update', {
        p_donation_slot_id: slot.id,
        p_donor_id: user.id,
        p_donation_date: slot.date,
        p_food_type: data.food_type,
        p_estimated_servings: estimatedServings,
        p_contact_phone: data.contact_phone,
        p_special_notes: data.special_notes || null
      })

      if (bookingError) {
        setError(bookingError.message)
      } else {
        onSuccess(bookingData)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-elegant border-gray-200/50">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {/* Slot Details */}
        <div className="bg-gradient-to-br from-[#D4A574]/5 to-[#EA8B6F]/5 p-2.5 sm:p-4 rounded-lg mb-3 sm:mb-6 border border-[#D4A574]/20">
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{slot.monastery?.name || slot.monastery_name || 'Monastery'}</h3>

          <div className="space-y-2 text-sm sm:text-base text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A574] flex-shrink-0" />
              <span className="leading-tight">
                {format(parseISO(slot.date), 'MMM d, yyyy')} at{' '}
                {format(parseISO(`2000-01-01T${slot.time_slot}`), 'h:mm a')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EA8B6F] flex-shrink-0" />
              <span className="leading-tight">{slot.monks_fed || 0}/{slot.monastery?.capacity || slot.monks_capacity || 0} {t('servingsCapacityUsed')}</span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4A574] flex-shrink-0 mt-0.5" />
              <span className="leading-tight break-words">{slot.monastery?.address || slot.monastery_address || 'Address not provided'}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2 text-xs sm:text-sm mb-2">
              <span className="font-medium">{t('capacityUsage')}</span>
              <span className="text-[#D4A574]">{(slot.monastery?.capacity || slot.monks_capacity || 0) - (slot.monks_fed || 0)} {t('servingsRemaining')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((slot.monks_fed || 0) / (slot.monastery?.capacity || slot.monks_capacity || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {(slot.monastery?.special_requirements || slot.special_requirements) && (
            <div className="mt-3 text-xs sm:text-sm text-trust-800 bg-trust-50 p-2.5 sm:p-3 rounded-lg border border-trust-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-trust-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-trust-800">{t('specialRequirementsFor')} {slot.monastery?.name || slot.monastery_name || t('theMonastery')}</h4>
                  <p className="mt-1 text-xs sm:text-sm text-trust-700">{slot.monastery?.special_requirements || slot.special_requirements}</p>
                </div>
              </div>
            </div>
          )}

          {slot.booking_notes && (
            <div className="mt-3 p-2.5 sm:p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-primary-800">{t('importantNotesFrom')} {slot.monastery?.name || slot.monastery_name || t('theMonastery')}</h4>
                  <p className="mt-1 text-xs sm:text-sm text-primary-700">{slot.booking_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <TextField
                name="food_type"
                label={t('typeOfFood')}
                placeholder={t('typeOfFoodPlaceholder')}
                required
              />

              <TextField
                name="estimated_servings"
                label={t('estimatedServings')}
                placeholder={t('estimatedServingsPlaceholder', {
                  remaining: (slot.monastery?.capacity || slot.monks_capacity || 0) - (slot.monks_fed || 0)
                })}
                required
              />
            </div>

            <TextField
              name="contact_phone"
              label={t('contactPhone')}
              type="tel"
              placeholder={t('contactPhonePlaceholder')}
              required
            />

            <TextareaField
              name="special_notes"
              label={t('specialNotes')}
              placeholder={t('specialNotesPlaceholder')}
              rows={3}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                {loading ? t('booking') : t('confirmBooking')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto border-[#D4A574]/40 text-[#C69564] hover:bg-[#D4A574]/10 hover:border-[#D4A574]/60 transition-all"
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
