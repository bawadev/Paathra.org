'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { Search, MapPin, Clock, Users, ExternalLink } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DonationSlot, Monastery } from '@/lib/types'

interface DonationSlotWithMonastery extends DonationSlot {
  monastery?: Monastery
}

interface MonasterySlotsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  slots: DonationSlotWithMonastery[]
  onSlotSelect: (slot: DonationSlotWithMonastery) => void
  onMonasteryNavigate: (monasteryId: string) => void
}

interface UserLocation {
  latitude: number
  longitude: number
}

export function MonasterySlotsDialog({
  open,
  onOpenChange,
  date,
  slots,
  onSlotSelect,
  onMonasteryNavigate
}: MonasterySlotsDialogProps) {
  const t = useTranslations('SlotsDialog')
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Get user's location on component mount
  useEffect(() => {
    if (open && !userLocation && !locationLoading) {
      getUserLocation()
    }
    
    // Prevent body scroll when dialog is open
    if (open) {
      // Store current scroll position
      setScrollY(window.scrollY)
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed'
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scrolling
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
    
    return () => {
      // Ensure body scroll is restored when component unmounts
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [open, scrollY])

  const getUserLocation = () => {
    setLocationLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setLocationLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationLoading(false)
        }
      )
    } else {
      console.error('Geolocation is not supported')
      setLocationLoading(false)
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter and sort slots by search query and distance
  const filteredAndSortedSlots = useMemo(() => {
    let filtered = slots.filter(slot => 
      slot.monastery && 
      slot.monastery.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        if (!a.monastery?.latitude || !a.monastery?.longitude || 
            !b.monastery?.latitude || !b.monastery?.longitude) {
          return 0
        }
        
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.monastery.latitude,
          a.monastery.longitude
        )
        
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.monastery.latitude,
          b.monastery.longitude
        )
        
        return distanceA - distanceB
      })
    }

    return filtered
  }, [slots, searchQuery, userLocation])

  const handleSlotSelect = (slot: DonationSlotWithMonastery) => {
    onSlotSelect(slot)
    onOpenChange(false)
  }

  const handleMonasteryNavigate = (monasteryId: string) => {
    onMonasteryNavigate(monasteryId)
    onOpenChange(false)
  }

  const getDistanceDisplay = (monastery: any) => {
    if (!userLocation || !monastery?.latitude || !monastery?.longitude) {
      return null
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      monastery.latitude,
      monastery.longitude
    )

    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4 border-b">
          <DialogTitle className="text-lg sm:text-2xl font-bold leading-tight">
            {t('title')} {date && format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            {filteredAndSortedSlots.length !== 1
              ? t('slotsAvailablePlural', { count: filteredAndSortedSlots.length })
              : t('slotsAvailable', { count: filteredAndSortedSlots.length })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Search Bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base h-10 border-[#D4A574]/30 focus:border-[#D4A574] focus:ring-[#D4A574]"
              />
            </div>
          </div>

          {/* Location Status */}
          {locationLoading && (
            <div className="px-4 sm:px-6 py-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4A574]"></div>
                {t('gettingLocation')}
              </div>
            </div>
          )}

          {/* Slots List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4" style={{
            maxHeight: 'calc(90vh - 200px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#D4A574 #f3f4f6'
          }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: #f3f4f6;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: #D4A574;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #C69564;
            }
          `}</style>
            {filteredAndSortedSlots.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base text-gray-600">
                  {searchQuery ? t('noMatchSearch') : t('noSlotsForDate')}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedSlots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="shadow-elegant hover:shadow-elegant-lg transition-all duration-300 border border-gray-200/50 hover:border-[#D4A574]/30"
                  >
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          {/* Monastery Name and Distance */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {slot.monastery?.name || t('unknownMonastery')}
                            </h3>
                            {getDistanceDisplay(slot.monastery) && (
                              <Badge variant="secondary" className="bg-[#D4A574]/10 text-[#C69564] border-[#D4A574]/30 text-xs font-medium">
                                {getDistanceDisplay(slot.monastery)}
                              </Badge>
                            )}
                          </div>

                          {/* Address */}
                          {slot.monastery?.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-500" />
                              <span className="line-clamp-2">{slot.monastery.address}</span>
                            </div>
                          )}

                          {/* Slot Details */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-[#D4A574]" />
                              <span className="font-medium">{slot.time_slot}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-compassion-600" />
                              <span>{slot.max_donors} {t('donorsMax')}</span>
                            </div>
                            <Badge
                              variant={slot.is_available ? "default" : "secondary"}
                              className={cn(
                                "text-xs font-medium",
                                slot.is_available && "bg-compassion-100 text-compassion-800 border-compassion-200",
                                !slot.is_available && "bg-gray-100 text-gray-800 border-gray-200"
                              )}
                            >
                              {slot.is_available ? t('available') : t('full')}
                            </Badge>
                          </div>

                          {/* Special Requirements */}
                          {slot.special_requirements && (
                            <div className="mt-3 text-sm text-gray-600 bg-trust-50 p-2 rounded-lg">
                              <strong className="text-trust-800">{t('requirements')}</strong> {slot.special_requirements}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons - Side on desktop, bottom on mobile */}
                        <div className="flex sm:flex-col gap-2 sm:ml-4">
                          {slot.is_available && (
                            <Button
                              size="sm"
                              onClick={() => handleSlotSelect(slot)}
                              className="bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              {t('selectSlot')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMonasteryNavigate(slot.monastery_id)}
                            className="flex items-center justify-center gap-1 flex-1 sm:flex-none border-[#D4A574]/40 text-[#C69564] hover:bg-[#D4A574]/10 hover:border-[#D4A574]/60 transition-all"
                          >
                            {t('view')}
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}